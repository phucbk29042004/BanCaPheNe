'use strict';
const express = require('express');
const router = express.Router();
const { webhook } = require('../controllers/payosController');

// Webhook không cần xác thực JWT — PayOS tự ký HMAC
router.post('/webhook', express.raw({ type: 'application/json' }), webhook);

module.exports = router;
