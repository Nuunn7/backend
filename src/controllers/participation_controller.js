const participationService = require('../services/participation_service');
const { AppError } = require('../utils/errors');

// GET /participations
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

// GET /participations/:id
const getById = async (req, res, next) => {
  try {
    const participation = await participationService.getById(req.params.id);

    // volunteers can only view their own participations
    if (
      req.user.role === 'VOLUNTEER' &&
      participation.user_id !== req.user.id
    ) {
      throw new AppError('Not authorized to view this participation', 403);
    }

    // organizers can only view participations for activities they organize
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

// PATCH /participations/:id/reject
const reject = async (req, res, next) => {
  try {
    const result = await participationService.reject(req.params.id, req.user);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// DELETE /participations/:id
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