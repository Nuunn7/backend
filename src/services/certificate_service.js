const crypto = require('crypto');
const pool = require('../config/db');
const blockchainService = require('./blockchain_service');
const { AppError } = require('../utils/errors');
const logger = require('../utils/logger');

const generateCertificateHash = (data) => {
  const str = `${data.userId}-${data.activityId}-${data.hours}-${data.issuedAt}`;
  return crypto.createHash('sha256').update(str).digest('hex');
};

const issue = async (participationId, issuedById) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Оролцооны мэдээлэл авах
    const { rows: pRows } = await client.query(
      `SELECT p.*, u.name AS user_name, u.identifier,
              a.title AS activity_title
       FROM app.participations p
       JOIN app.users u ON u.id = p.user_id
       JOIN app.activities a ON a.id = p.activity_id
       WHERE p.id = $1 AND p.status = 'APPROVED'`,
      [participationId]
    );

    if (!pRows.length) {
      throw new AppError('Баталгаажсан оролцоо олдсонгүй', 404);
    }

    const participation = pRows[0];

    // 2. Давхар батламж шалгах
    const { rows: existing } = await client.query(
      'SELECT id FROM app.certificates WHERE participation_id = $1',
      [participationId]
    );

    if (existing.length) {
      throw new AppError('Энэ оролцоонд батламж аль хэдийн олгогдсон байна', 400);
    }

    // 3. SHA-256 хэш үүсгэх
    const issuedAt = new Date().toISOString();
    const hash = generateCertificateHash({
      userId: participation.user_id,
      activityId: participation.activity_id,
      hours: participation.hours,
      issuedAt,
    });

    logger.info(`Батламжийн хэш үүслээ: ${hash.slice(0, 16)}...`);

    // 4. Блокчейнд бүртгэх
    let txHash = null;
    let blockNumber = null;

    try {
      const bcResult = await blockchainService.registerOnBlockchain(hash, null);
      txHash = bcResult.txHash;
      blockNumber = bcResult.blockNumber;
      logger.info(`Блокчейнд бүртгэгдлээ: tx=${txHash}`);
    } catch (bcErr) {
      logger.warn(`Блокчейн бүртгэлт амжилтгүй, DB-д хадгална: ${bcErr.message}`);
    }

    // 5. DB-д хадгалах
    const { rows: certRows } = await client.query(
      `INSERT INTO app.certificates
         (participation_id, user_id, activity_id, hash, tx_hash, issued_by, issued_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        participationId,
        participation.user_id,
        participation.activity_id,
        hash,
        txHash,
        issuedById,
        issuedAt,
      ]
    );

    await client.query('COMMIT');

    logger.info(`Батламж олгогдлоо: id=${certRows[0].id}`);

    return {
      ...certRows[0],
      activity_title: participation.activity_title,
      user_name: participation.user_name,
      identifier: participation.identifier,
      blockNumber,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// ── Хэрэглэгчийн батламжуудыг авах ─────────────────────────────────────────
const getByUser = async (userId) => {
  const { rows } = await pool.query(
    `SELECT c.*, a.title AS activity_title, a.date AS activity_date,
            p.hours
     FROM app.certificates c
     JOIN app.activities a ON a.id = c.activity_id
     JOIN app.participations p ON p.id = c.participation_id
     WHERE c.user_id = $1
     ORDER BY c.issued_at DESC`,
    [userId]
  );
  return rows;
};

// ── Нэг батламж авах ────────────────────────────────────────────────────────
const getById = async (id, userId) => {
  const { rows } = await pool.query(
    `SELECT c.*, a.title AS activity_title, a.date AS activity_date,
            p.hours, u.name AS user_name, u.identifier
     FROM app.certificates c
     JOIN app.activities a ON a.id = c.activity_id
     JOIN app.participations p ON p.id = c.participation_id
     JOIN app.users u ON u.id = c.user_id
     WHERE c.id = $1 AND c.user_id = $2`,
    [id, userId]
  );

  if (!rows.length) throw new AppError('Батламж олдсонгүй', 404);
  return rows[0];
};

// ── Хэшээр баталгаажуулах ───────────────────────────────────────────────────
const verifyByHash = async (hash) => {
  const { rows } = await pool.query(
    `SELECT c.*, a.title AS activity_title, a.date AS activity_date,
            p.hours, u.name AS user_name, u.identifier
     FROM app.certificates c
     JOIN app.activities a ON a.id = c.activity_id
     JOIN app.participations p ON p.id = c.participation_id
     JOIN app.users u ON u.id = c.user_id
     WHERE c.hash = $1`,
    [hash]
  );

  if (!rows.length) {
    return { isValid: false, message: 'Батламж олдсонгүй' };
  }

  const cert = rows[0];

  // Блокчейнээс баталгаажуулах
  let blockchainVerified = false;
  let blockchainInfo = null;

  try {
    const bcResult = await blockchainService.verifyOnBlockchain(hash);
    blockchainVerified = bcResult.isValid;
    blockchainInfo = bcResult;
  } catch (err) {
    logger.warn(`Блокчейн баталгаажуулалт амжилтгүй: ${err.message}`);
  }

  return {
    isValid: true,
    blockchainVerified,
    blockchainInfo,
    certificate: cert,
  };
};

const getByIdentifier = async (identifier) => {
  const { rows } = await pool.query(
    `SELECT c.*, a.title AS activity_title, a.date AS activity_date,
            p.hours, u.name AS user_name, u.identifier
     FROM app.certificates c
     JOIN app.activities a ON a.id = c.activity_id
     JOIN app.participations p ON p.id = c.participation_id
     JOIN app.users u ON u.id = c.user_id
     WHERE u.identifier = $1
     ORDER BY c.issued_at DESC`,
    [identifier]
  );
  return rows;
};

module.exports = { issue, getByUser, getById, verifyByHash, getByIdentifier };