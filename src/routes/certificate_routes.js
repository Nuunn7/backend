const express = require('express');
const router = express.Router();
const {
  issueCertificate,
  getMyCertificates,
  getCertificateById,
  verifyCertificate,
  getNetworkInfo,
} = require('../controllers/certificate_controller');
const { protect, authorize } = require('../middlewares/auth');

// Public routes
router.get('/verify/:hash', verifyCertificate);

// Protected routes
router.use(protect);

router.get('/', getMyCertificates);
router.get('/network', getNetworkInfo);
router.get('/:id', getCertificateById);
router.post(
  '/issue/:participationId',
  authorize('ORGANIZER', 'ADMIN'),
  issueCertificate
);

module.exports = router;