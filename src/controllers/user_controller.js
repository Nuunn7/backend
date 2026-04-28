const userService = require('../services/user_service');
const { AppError } = require('../utils/errors');

// GET /users
const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const result = await userService.getAll({ page, limit, role, search });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

// GET /users/:id
const getById = async (req, res, next) => {
  try {
    const user = await userService.getById(req.params.id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// PUT /users/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, email, identifier } = req.body;
    const user = await userService.updateProfile(req.user.id, { name, email, identifier });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// PUT /users/password
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

// DELETE /users/:id
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

// GET /users/:id/participations
const getParticipations = async (req, res, next) => {
  try {
    // volunteers can only see their own participations
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

// GET /users/:id/certificates
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

// PATCH /users/:id/role
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