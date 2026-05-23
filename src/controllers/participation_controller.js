const participationService = require('../services/participation_service');
const { AppError } = require('../utils/errors');

const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, userId, activityId } = req.query;
    const result = await participationService.getAll({
      page,
      limit,
      status,
      userId,
      activityId,
    });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const participation = await participationService.getById(req.params.id);

    if (
      req.user.role === 'VOLUNTEER' &&
      participation.user_id !== req.user.id
    ) {
      throw new AppError('Not authorized to view this participation', 403);
    }

    if (
      req.user.role === 'ORGANIZER' &&
      participation.organizer_id !== req.user.id
    ) {
      throw new AppError('Not authorized to view this participation', 403);
    }

    res.json({ success: true, data: participation });
  } catch (err) {
    next(err);
  }
};

const reject = async (req, res, next) => {
  try {
    const result = await participationService.reject(req.params.id, req.user);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await participationService.remove(req.params.id, req.user);
    res.json({ success: true, message: 'Participation deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAll,
  getById,
  reject,
  remove,
};