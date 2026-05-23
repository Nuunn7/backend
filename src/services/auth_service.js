const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db');
const { AppError } = require('../utils/errors');
const { sendPasswordResetEmail } = require('../utils/email');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const register = async ({ name, email, password, role = 'VOLUNTEER', identifier }) => {
  const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    throw new AppError('Email already registered', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const result = await db.query(
    `INSERT INTO users (name, email, password, role, identifier)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, role, identifier, created_at`,
    [name, email, hashedPassword, role, identifier]
  );

  const user = result.rows[0];
  const token = generateToken(user.id);

  return { user, token };
};

const login = async (email, password) => {
  const result = await db.query(
    'SELECT id, name, email, password, role, identifier FROM users WHERE email = $1',
    [email]
  );

  const user = result.rows[0];
  if (!user) throw new AppError('Invalid email or password', 401);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError('Invalid email or password', 401);

  const { password: _, ...userWithoutPassword } = user;
  const token = generateToken(user.id);

  return { user: userWithoutPassword, token };
};

const forgotPassword = async (email) => {
  const result = await db.query('SELECT id FROM users WHERE email = $1', [email]);
  const user = result.rows[0];

  if (!user) return;

  await db.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [user.id]);

  const resetToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db.query(
    `INSERT INTO password_reset_tokens (user_id, token, expires_at)
     VALUES ($1, $2, $3)`,
    [user.id, resetToken, expiresAt]
  );

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  await sendPasswordResetEmail(email, resetUrl);
};

const resetPassword = async (token, newPassword) => {
  const result = await db.query(
    `SELECT * FROM password_reset_tokens
     WHERE token = $1 AND used = FALSE AND expires_at > NOW()`,
    [token]
  );

  const resetRecord = result.rows[0];
  if (!resetRecord) {
    throw new AppError('Токен хүчингүй эсвэл хугацаа дууссан байна', 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await db.query('UPDATE users SET password = $1 WHERE id = $2', [
    hashedPassword,
    resetRecord.user_id,
  ]);

  await db.query('UPDATE password_reset_tokens SET used = TRUE WHERE id = $1', [
    resetRecord.id,
  ]);
};

module.exports = { register, login, forgotPassword, resetPassword };