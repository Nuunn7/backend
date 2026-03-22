const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificate_controller');
const { protect, authorize } = require('../middlewares/auth');

router.get('/verify/:hash', certificateController.verify);
router.get('/', protect, certificateController.getMyCertificates);
router.get('/:id', certificateController.getById);
router.post('/issue/:participationId', protect, authorize('ORGANIZER', 'ADMIN'), certificateController.issue);

module.exports = router;