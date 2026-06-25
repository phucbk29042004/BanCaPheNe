'use strict';
const express = require('express');
const router = express.Router();
const { getAll, lookup, create, update, getOrders } = require('../controllers/customerController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const upload = require('../middlewares/upload');

router.get('/', authenticate, authorize('admin', 'staff'), getAll);
router.get('/lookup/:phone', authenticate, lookup);
router.post('/', authenticate, upload.single('avatar'), create);
router.put('/:id', authenticate, authorize('admin'), upload.single('avatar'), update);
router.get('/:id/orders', authenticate, authorize('admin', 'staff'), getOrders);

module.exports = router;
