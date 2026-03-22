const crypto = require('crypto');
const db = require('../config/db');
const { AppError } = require('../utils/errors');

const generateHash = (data) => {
  const payload = JSON.stringify({
    userId: data.userId,
    activityId: data.activityId,
    hours: data.hours,
    issuedAt: data.issuedAt,
  });
  return crypto.createHash('sha256').update(payload).digest('hex');
};

const issue = async (participationId, issuer) => {
  const partResult = await db.query(
    `SELECT p.*, a.title AS activity_title, a.date AS activity_date,
       u.name AS user_name, u.email AS user_email, u.identifier
     FROM participations p
     JOIN activities a ON p.activity_id = a.id
     JOIN users u ON p.user_id = u.id
     WHERE p.id = $1 AND p.status = 'VERIFIED'`,
    [participationId]
  );

  const participation = partResult.rows[0];
  if (!participation) throw new AppError('Verified participation not found', 404);

  const existing = await db.query(
    'SELECT id FROM certificates WHERE participation_id = $1',
    [participationId]
  );
  if (existing.rows.length > 0) throw new AppError('Certificate already issued', 400);

  const issuedAt = new Date().toISOString();
  const hash = generateHash({
    userId: participation.user_id,
    activityId: participation.activity_id,
    hours: participation.hours,
    issuedAt,
  });

  const result = await db.query(
    `INSERT INTO certificates
       (participation_id, user_id, activity_id, hash, issued_by, issued_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [participationId, participation.user_id, participation.activity_id, hash, issuer.id, issuedAt]
  );

  return { ...result.rows[0], participation };
};

const getByUser = async (userId) => {
  const result = await db.query(
    `SELECT c.*, a.title AS activity_title, a.date AS activity_date, p.hours
     FROM certificates c
     JOIN activities a ON c.activity_id = a.id
     JOIN participations p ON c.participation_id = p.id
     WHERE c.user_id = $1
     ORDER BY c.issued_at DESC`,
    [userId]
  );
  return result.rows;
};

const getById = async (id) => {
  const result = await db.query(
    `SELECT c.*, a.title AS activity_title, u.name AS user_name
     FROM certificates c
     JOIN activities a ON c.activity_id = a.id
     JOIN users u ON c.user_id = u.id
     WHERE c.id = $1`,
    [id]
  );
  if (!result.rows[0]) throw new AppError('Certificate not found', 404);
  return result.rows[0];
};

const verifyByHash = async (hash) => {
  const result = await db.query(
    `SELECT c.*, a.title AS activity_title, a.date AS activity_date,
       u.name AS user_name, u.identifier, p.hours
     FROM certificates c
     JOIN activities a ON c.activity_id = a.id
     JOIN users u ON c.user_id = u.id
     JOIN participations p ON c.participation_id = p.id
     WHERE c.hash = $1`,
    [hash]
  );

  const certificate = result.rows[0];
  if (!certificate) throw new AppError('Certificate not found', 404);

  return { certificate, verifiedAt: new Date().toISOString() };
};

module.exports = { issue, getByUser, getById, verifyByHash };