const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { AppError } = require('../utils/errors');

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

module.exports = { register, login };