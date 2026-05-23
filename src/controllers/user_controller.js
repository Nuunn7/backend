const userService = require('../services/user_service');
const { AppError } = require('../utils/errors');

const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const result = await userService.getAll({ page, limit, role, search });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const user = await userService.getById(req.params.id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, email, identifier } = req.body;
    const user = await userService.updateProfile(req.user.id, { name, email, identifier });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await userService.changePassword(
      req.user.id,
      currentPassword,
      newPassword
    );
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      throw new AppError('You cannot delete your own account', 400);
    }
    await userService.remove(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};

const getParticipations = async (req, res, next) => {
  try {
    if (
      req.user.role === 'VOLUNTEER' &&
      parseInt(req.params.id) !== req.user.id
    ) {
      throw new AppError('Not authorized to view this resource', 403);
    }
    const data = await userService.getParticipations(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getCertificates = async (req, res, next) => {
  try {
    if (
      req.user.role === 'VOLUNTEER' &&
      parseInt(req.params.id) !== req.user.id
    ) {
      throw new AppError('Not authorized to view this resource', 403);
    }
    const data = await userService.getCertificates(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const changeRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (parseInt(req.params.id) === req.user.id) {
      throw new AppError('You cannot change your own role', 400);
    }
    const user = await userService.changeRole(req.params.id, role);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
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