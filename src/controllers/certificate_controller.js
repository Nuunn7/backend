const certificateService = require('../services/certificate_service');
const blockchainService = require('../services/blockchain_service');
const {AppError} = require('../utils/errors');

// POST /api/v1/certificates/issue/:participationId
const issueCertificate = async (req, res, next) => {
  try {
    const { participationId } = req.params;
    const issuedById = req.user.id;

    const certificate = await certificateService.issue(
      parseInt(participationId),
      issuedById
    );

    res.status(201).json({
      status: 'success',
      message: 'Батламж амжилттай олгогдлоо',
      data: certificate,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/certificates
const getMyCertificates = async (req, res, next) => {
  try {
    const certificates = await certificateService.getByUser(req.user.id);

    res.status(200).json({
      status: 'success',
      results: certificates.length,
      data: certificates,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/certificates/:id
const getCertificateById = async (req, res, next) => {
  try {
    const certificate = await certificateService.getById(
      parseInt(req.params.id),
      req.user.id
    );

    res.status(200).json({
      status: 'success',
      data: certificate,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/certificates/verify/:hash 
const verifyCertificate = async (req, res, next) => {
  try {
    const { hash } = req.params;

    if (!hash || hash.length !== 64) {
      return next(new AppError('Хэш утга буруу байна', 400));
    }

    const result = await certificateService.verifyByHash(hash);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/certificates/network
const getNetworkInfo = async (req, res, next) => {
  try {
    const info = await blockchainService.getNetworkInfo();
    res.status(200).json({ status: 'success', data: info });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  issueCertificate,
  getMyCertificates,
  getCertificateById,
  verifyCertificate,
  getNetworkInfo,
};