'use strict';
const express = require('express');
const router = express.Router();
const { checkIn, checkOut, getAttendances, getMyAttendances, editAttendance, getSalarySummary } = require('../controllers/shiftController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

router.post('/check-in', authenticate, checkIn);
router.post('/check-out', authenticate, checkOut);
router.get('/', authenticate, authorize('admin'), getAttendances);
router.get('/my', authenticate, getMyAttendances);
router.put('/:id', authenticate, authorize('admin'), editAttendance);
router.get('/salary-summary', authenticate, authorize('admin'), getSalarySummary);

module.exports = router;
