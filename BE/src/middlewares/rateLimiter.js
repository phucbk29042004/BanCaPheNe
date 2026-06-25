'use strict';
const rateLimit = require('express-rate-limit');

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 2000, // Limit each IP to 2000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút.',
    code: 'TOO_MANY_REQUESTS'
  }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 10, // Limit each IP to 10 login requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Bạn đã đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút.',
    code: 'TOO_MANY_LOGIN_ATTEMPTS'
  }
});

module.exports = { generalLimiter, loginLimiter };
