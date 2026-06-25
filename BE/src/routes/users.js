'use strict';
const express = require('express');
const router = express.Router();
const { getAll, getOne, create, update, toggle, getAttendances, getSalarySummary, deleteUser } = require('../controllers/userController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const upload = require('../middlewares/upload');

router.get('/', authenticate, authorize('admin'), getAll);
router.get('/:id', authenticate, authorize('admin'), getOne);
router.post('/', authenticate, authorize('admin'), upload.single('avatar'), create);
router.put('/:id', authenticate, authorize('admin'), upload.single('avatar'), update);
router.delete('/:id', authenticate, authorize('admin'), deleteUser);
router.patch('/:id/toggle', authenticate, authorize('admin'), toggle);
router.get('/:id/attendances', authenticate, authorize('admin'), getAttendances);
router.get('/:id/salary', authenticate, authorize('admin'), getSalarySummary);

module.exports = router;
