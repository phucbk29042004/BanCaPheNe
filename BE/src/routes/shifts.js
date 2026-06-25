'use strict';
const express = require('express');
const router = express.Router();
const { getAll, getOne, create, update, remove, getToday } = require('../controllers/shiftController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

router.get('/', authenticate, getAll);
router.get('/today', authenticate, getToday);
router.get('/:id', authenticate, getOne);
router.post('/', authenticate, authorize('admin'), create);
router.put('/:id', authenticate, authorize('admin'), update);
router.delete('/:id', authenticate, authorize('admin'), remove);

module.exports = router;
