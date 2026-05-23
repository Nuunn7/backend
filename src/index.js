require('dotenv').config();
const app = require('./app');
const logger = require('./utils/logger');
const { autoUpdateStatus } = require('./services/activity_service');
const pool = require('./config/db');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);

  autoUpdateStatus();
  logger.info('Activity status auto-update initialized');

  setInterval(autoUpdateStatus,  60 * 1000);

  setInterval(async () => {
    try { await pool.query('SELECT 1'); } catch (e) {}
  }, 4 * 60 * 1000);
});

process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});