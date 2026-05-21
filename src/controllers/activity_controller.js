const activityService = require('../services/activity_service');

const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const result = await activityService.getAll({ page, limit, status, search });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const activity = await activityService.getById(req.params.id);
    res.json({ success: true, data: activity });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const activity = await activityService.create({
      ...req.body,
      organizerId: req.user.id,
    });
    res.status(201).json({ success: true, data: activity });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const activity = await activityService.update(req.params.id, req.body, req.user);
    res.json({ success: true, data: activity });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await activityService.remove(req.params.id);
    res.json({ success: true, message: 'Activity deleted' });
  } catch (err) {
    next(err);
  }
};

const join = async (req, res, next) => {
  try {
    const result = await activityService.join(req.params.id, req.user.id);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const verifyParticipation = async (req, res, next) => {
  try {
    const result = await activityService.verifyParticipation(
      req.params.id,
      req.params.userId,
      req.body.hours,
      req.user
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const getParticipations = async (req, res, next) => {
  try {
    const result = await activityService.getParticipations(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const cancelActivity = async (req, res, next) => {
  try {
    await activityService.cancelActivity(req.params.id, req.user);
    res.json({ success: true, message: 'Үйл ажиллагаа цуцлагдлаа' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, remove, join, verifyParticipation, getParticipations, cancelActivity };