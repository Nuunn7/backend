const authService = require('../services/auth_service');

const register = async (req, res, next) => {
  try {
    const { name, email, password, role, identifier } = req.body;
    const result = await authService.register({ name, email, password, role, identifier });
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    res.json({ success: true, message: 'Logged out' });
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

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    await authService.forgotPassword(email);
    // Always return success to avoid email enumeration
    res.json({ success: true, message: 'Хэрэв имэйл бүртгэлтэй бол холбоос илгээгдлээ' });
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    await authService.resetPassword(token, newPassword);
    res.json({ success: true, message: 'Нууц үг амжилттай солигдлоо' });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, logout, getMe, forgotPassword, resetPassword };