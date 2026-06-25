'use strict';
const express = require('express');
const router = express.Router();
const { getAll, create, update, toggleStatus, remove, getCurrentOrder } = require('../controllers/tableController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

router.get('/', authenticate, getAll);
router.post('/', authenticate, authorize('admin'), create);
router.put('/:id', authenticate, authorize('admin'), update);
router.patch('/:id/status', authenticate, toggleStatus);
router.delete('/:id', authenticate, authorize('admin'), remove);
router.get('/:id/current-order', authenticate, getCurrentOrder);

module.exports = router;
