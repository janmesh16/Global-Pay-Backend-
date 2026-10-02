const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const env = require('./config/env');
const swaggerSpec = require('./config/swagger');
const apiRouter = require('./routes/index');
const { notFound, globalErrorHandler } = require('./middleware/error');
const { sendSuccess } = require('./utils/response');

const app = express();

// ── Global security middleware ──
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin === env.CLIENT_URL) {
      return callback(null, true);
    }
    return callback(null, env.CLIENT_URL);
  },
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(mongoSanitize());
app.use(hpp());

// ── Logging ──
if (env.isDev) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ── Health check ──
app.get('/health', (req, res) => {
  sendSuccess(res, 'GlobalPay API is running', {
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// ── API Documentation ──
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'GlobalPay API Documentation',
}));

// ── API Routes ──
app.use('/api', apiRouter);

// ── Error handling ──
app.use(notFound);
app.use(globalErrorHandler);

module.exports = app;
