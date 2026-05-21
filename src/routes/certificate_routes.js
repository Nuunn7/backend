const express = require('express');
const router = express.Router();
const {
  issueCertificate,
  getMyCertificates,
  getCertificateById,
  verifyCertificate,
  getNetworkInfo,
} = require('../controllers/certificate_controller');
const { protect } = require('../middlewares/auth');

router.get('/verify/:hash', verifyCertificate);

router.use(protect);

router.get('/', getMyCertificates);
router.get('/network', getNetworkInfo);
router.get('/:id', getCertificateById);
router.post('/issue/:participationId', issueCertificate);

module.exports = router;