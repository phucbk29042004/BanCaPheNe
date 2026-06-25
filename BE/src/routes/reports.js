'use strict';
const express = require('express');
const router = express.Router();
const { getRevenue, getProducts, getStaff, getCustomers, getVouchers, exportExcel, exportPdf, getActivityLogs } = require('../controllers/reportController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

router.get('/revenue', authenticate, authorize('admin'), getRevenue);
router.get('/products', authenticate, authorize('admin'), getProducts);
router.get('/staff', authenticate, authorize('admin'), getStaff);
router.get('/customers', authenticate, authorize('admin'), getCustomers);
router.get('/vouchers', authenticate, authorize('admin'), getVouchers);
router.get('/activity-logs', authenticate, authorize('admin'), getActivityLogs);
router.get('/export/excel', authenticate, authorize('admin'), exportExcel);
router.get('/export/pdf', authenticate, authorize('admin'), exportPdf);

module.exports = router;
