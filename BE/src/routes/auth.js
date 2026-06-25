'use strict';
const express = require('express');
const router = express.Router();
const { login, logout, me } = require('../controllers/authController');
const authenticate = require('../middlewares/authenticate');

const { loginLimiter } = require('../middlewares/rateLimiter');

router.post('/login', loginLimiter, login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, me);

module.exports = router;
