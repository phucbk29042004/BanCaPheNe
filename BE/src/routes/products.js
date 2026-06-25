'use strict';
const express = require('express');
const router = express.Router();
const { getAll, getOne, create, update, remove, toggle } = require('../controllers/productController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const upload = require('../middlewares/upload');

router.get('/', authenticate, getAll);
router.get('/:id', authenticate, getOne);
router.post('/', authenticate, authorize('admin'), upload.single('image'), create);
router.put('/:id', authenticate, authorize('admin'), upload.single('image'), update);
router.delete('/:id', authenticate, authorize('admin'), remove);
router.patch('/:id/toggle', authenticate, authorize('admin'), toggle);

module.exports = router;
