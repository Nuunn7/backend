const express = require('express');
const router = express.Router();

const authRoutes = require('./auth_routes');
const userRoutes = require('./user_routes');
const activityRoutes = require('./activity_routes');
const participationRoutes = require('./participation_routes');
const certificateRoutes = require('./certificate_routes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/activities', activityRoutes);
router.use('/participations', participationRoutes);
router.use('/certificates', certificateRoutes);

module.exports = router;