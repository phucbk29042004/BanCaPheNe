'use strict';
const express = require('express');
const router = express.Router();
const { create, getAll, getOne, cancel, payCash, payQR, deleteOrder } = require('../controllers/orderController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

router.post('/', authenticate, create);
router.get('/', authenticate, getAll);
router.get('/:id', authenticate, getOne);
router.patch('/:id/cancel', authenticate, cancel);
router.delete('/:id', authenticate, deleteOrder);
router.post('/:id/pay-cash', authenticate, payCash);
router.post('/:id/pay-qr', authenticate, payQR);

module.exports = router;
