const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');

router.get('/', protect, (req, res) => {
  res.json({ success: true, message: 'Participations - TODO' });
});

module.exports = router;