const authService = require('../services/auth_service');
const { AppError } = require('../utils/errors');

const register = async (req, res, next) => {
  try {
    const { name, email, password, role, identifier } = req.body;
    const result = await authService.register({ name, email, password, role, identifier });
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    res.json({ success: true, data: req.user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, logout, getMe };