const { Pool } = require('pg');
const logger = require('../utils/logger');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('connect', (client) => {
  client.query(`SET search_path TO ${process.env.DB_SCHEMA || 'app'}`);
});

pool.on('error', (err) => {
  logger.error(`Database pool error: ${err.message}`);
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    await client.query(`SET search_path TO ${process.env.DB_SCHEMA || 'app'}`);
    logger.info('PostgreSQL connected successfully');
    client.release();
  } catch (err) {
    logger.error(`Database connection failed: ${err.message}`);
    process.exit(1);
  }
};

connectDB();

module.exports = pool;