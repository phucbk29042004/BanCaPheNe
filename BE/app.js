'use strict';
require('dotenv').config();
const express = require('express');
const path = require('path');

const helmet = require('helmet');
const cors = require('cors');
const requestLogger = require('./src/middlewares/requestLogger');
const { generalLimiter } = require('./src/middlewares/rateLimiter');

const app = express();

// Security and Logging Middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://res.cloudinary.com", "https://api.qrserver.com"],
      connectSrc: ["'self'", "https://cdn.jsdelivr.net"]
    }
  }
}));
app.use(cors());
app.use(requestLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', generalLimiter);

// Phục vụ thư mục FE như static files
app.use(express.static(path.join(__dirname, '..', 'FE')));

// API Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/users', require('./src/routes/users'));
app.use('/api/categories', require('./src/routes/categories'));
app.use('/api/products', require('./src/routes/products'));
app.use('/api/tables', require('./src/routes/tables'));
app.use('/api/customers', require('./src/routes/customers'));
app.use('/api/vouchers', require('./src/routes/vouchers'));
app.use('/api/orders', require('./src/routes/orders'));
app.use('/api/payos', require('./src/routes/payos'));
app.use('/api/invoices', require('./src/routes/invoices'));
app.use('/api/dashboard', require('./src/routes/dashboard'));
app.use('/api/shifts', require('./src/routes/shifts'));
app.use('/api/attendances', require('./src/routes/attendances'));
app.use('/api/reports', require('./src/routes/reports'));

// Fallback: Mọi request không phải API → trả về index.html (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'FE', 'index.html'));
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error('[ERROR]', err);
  res.status(500).json({ success: false, message: err.message || 'Lỗi máy chủ nội bộ.' });
});

module.exports = app;
