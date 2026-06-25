'use strict';
const express = require('express');
const router = express.Router();
const { getAll, create, update, toggle, remove, validate, getUsages } = require('../controllers/voucherController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

router.get('/', authenticate, authorize('admin', 'staff'), getAll);
router.post('/', authenticate, authorize('admin'), create);
router.put('/:id', authenticate, authorize('admin'), update);
router.patch('/:id/toggle', authenticate, authorize('admin'), toggle);
router.delete('/:id', authenticate, authorize('admin'), remove);
router.get('/validate/:code', authenticate, validate);
router.get('/:id/usages', authenticate, authorize('admin'), getUsages);

module.exports = router;
