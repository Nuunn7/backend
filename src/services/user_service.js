const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { AppError } = require('../utils/errors');

const getAll = async ({ page, limit, role, search }) => {
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const params = [];
  const conditions = [];
  let paramIndex = 1;

  if (role) {
    conditions.push(`role = $${paramIndex++}`);
    params.push(role.toUpperCase());
  }
  if (search) {
    conditions.push(`(name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await db.query(`SELECT COUNT(*) FROM users ${where}`, params);
  const total = parseInt(countResult.rows[0].count);

  params.push(parseInt(limit), offset);
  const result = await db.query(
    `SELECT id, name, email, role, identifier, created_at, updated_at
     FROM users
     ${where}
     ORDER BY created_at DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    params
  );

  return {
    data: result.rows,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

const getById = async (id) => {
  const result = await db.query(
    `SELECT id, name, email, role, identifier, created_at, updated_at
     FROM users
     WHERE id = $1`,
    [id]
  );
  if (!result.rows[0]) throw new AppError('User not found', 404);
  return result.rows[0];
};

const updateProfile = async (userId, { name, email, identifier }) => {
  // check email uniqueness if it is being changed
  if (email) {
    const existing = await db.query(
      'SELECT id FROM users WHERE email = $1 AND id <> $2',
      [email, userId]
    );
    if (existing.rows.length > 0) {
      throw new AppError('Email already in use', 400);
    }
  }

  const result = await db.query(
    `UPDATE users
     SET name       = COALESCE($1, name),
         email      = COALESCE($2, email),
         identifier = COALESCE($3, identifier),
         updated_at = NOW()
     WHERE id = $4
     RETURNING id, name, email, role, identifier, created_at, updated_at`,
    [name || null, email || null, identifier || null, userId]
  );
  if (!result.rows[0]) throw new AppError('User not found', 404);
  return result.rows[0];
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const result = await db.query(
    'SELECT password FROM users WHERE id = $1',
    [userId]
  );
  if (!result.rows[0]) throw new AppError('User not found', 404);

  const isMatch = await bcrypt.compare(currentPassword, result.rows[0].password);
  if (!isMatch) throw new AppError('Current password is incorrect', 401);

  const hashed = await bcrypt.hash(newPassword, 12);
  await db.query(
    'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
    [hashed, userId]
  );

  return { message: 'Password changed successfully' };
};

const remove = async (id) => {
  const result = await db.query(
    'DELETE FROM users WHERE id = $1 RETURNING id',
    [id]
  );
  if (!result.rows[0]) throw new AppError('User not found', 404);
};

const getParticipations = async (userId) => {
  const result = await db.query(
    `SELECT p.id, p.activity_id, p.status, p.hours, p.verified_at, p.created_at,
            a.title AS activity_title, a.date AS activity_date, a.location
     FROM participations p
     JOIN activities a ON p.activity_id = a.id
     WHERE p.user_id = $1
     ORDER BY p.created_at DESC`,
    [userId]
  );
  return result.rows;
};

const getCertificates = async (userId) => {
  const result = await db.query(
    `SELECT c.id, c.hash, c.tx_hash, c.ipfs_cid, c.issued_at, c.created_at,
            a.title AS activity_title, a.date AS activity_date,
            p.hours
     FROM certificates c
     JOIN activities a     ON c.activity_id = a.id
     JOIN participations p ON c.participation_id = p.id
     WHERE c.user_id = $1
     ORDER BY c.issued_at DESC`,
    [userId]
  );
  return result.rows;
};

const changeRole = async (id, role) => {
  const result = await db.query(
    `UPDATE users
     SET role = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, name, email, role, identifier, created_at, updated_at`,
    [role, id]
  );
  if (!result.rows[0]) throw new AppError('User not found', 404);
  return result.rows[0];
};

module.exports = {
  getAll,
  getById,
  updateProfile,
  changePassword,
  remove,
  getParticipations,
  getCertificates,
  changeRole,
};