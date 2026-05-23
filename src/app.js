require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const pool = require('./config/db');

const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');
const logger = require('./utils/logger');
const externalRouter = require('./routes/external');

const app = express();

app.use(helmet());

app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:3000',
    'https://your-vercel-app.vercel.app'
  ],
  credentials: true,
}));

setInterval(async () => {
  try {
    await pool.query('SELECT 1');
  } catch (e) {}
}, 4 * 60 * 1000);

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(morgan('combined', {
  stream: { write: (msg) => logger.http(msg.trim()) },
}));

app.get('/health', (req, res) => {
  res.json({ success: true, status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/v1', routes);
app.use('/api/external', externalRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;