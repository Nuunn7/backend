const certificateService = require('../services/certificate_service');

const getMyCertificates = async (req, res, next) => {
  try {
    const certificates = await certificateService.getByUser(req.user.id);
    res.json({ success: true, data: certificates });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const certificate = await certificateService.getById(req.params.id);
    res.json({ success: true, data: certificate });
  } catch (err) {
    next(err);
  }
};

const issue = async (req, res, next) => {
  try {
    const certificate = await certificateService.issue(req.params.participationId, req.user);
    res.status(201).json({ success: true, data: certificate });
  } catch (err) {
    next(err);
  }
};

const verify = async (req, res, next) => {
  try {
    const result = await certificateService.verifyByHash(req.params.hash);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyCertificates, getById, issue, verify };