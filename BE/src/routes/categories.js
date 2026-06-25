'use strict';
const express = require('express');
const router = express.Router();
const { getAll, create, update, remove } = require('../controllers/categoryController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

router.get('/', authenticate, getAll);
router.post('/', authenticate, authorize('admin'), create);
router.put('/:id', authenticate, authorize('admin'), update);
router.delete('/:id', authenticate, authorize('admin'), remove);

module.exports = router;
