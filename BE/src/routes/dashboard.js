'use strict';
const express = require('express');
const router = express.Router();
const { today, summary, topProducts, revenueChart, recentOrders } = require('../controllers/dashboardController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

router.use(authenticate, authorize('admin'));

router.get('/today', today);
router.get('/summary', summary);
router.get('/top-products', topProducts);
router.get('/revenue-chart', revenueChart);
router.get('/recent-orders', recentOrders);

module.exports = router;
