'use strict';
const db = require('../config/db');
const { success } = require('../utils/response');
const { getTodayString } = require('../utils/helpers');

// GET /api/dashboard/today
const today = (req, res) => {
  const todayStr = getTodayString();
  
  // 1. Thống kê hôm nay
  const stats = db.prepare(`
    SELECT
      COUNT(*) as total_orders,
      COALESCE(SUM(total), 0) as total_revenue,
      COALESCE(SUM(discount_total), 0) as total_discount,
      COALESCE(AVG(total), 0) as avg_order_value
  FROM orders
    WHERE date(created_at) = ? AND payment_status = 'paid'
  `).get(todayStr);

  const newCustomers = db.prepare(`
    SELECT COUNT(*) as count FROM customers WHERE date(created_at) = ?
  `).get(todayStr);

  // 2. Thống kê hôm qua để so sánh tăng trưởng
  const yesterdayStr = db.prepare("SELECT date('now', 'localtime', '-1 day') as date").get().date;
  const yesterdayStats = db.prepare(`
    SELECT
      COALESCE(SUM(total), 0) as total_revenue
    FROM orders
    WHERE date(created_at) = ? AND payment_status = 'paid'
  `).get(yesterdayStr);

  const yesterdayCustomers = db.prepare(`
    SELECT COUNT(*) as count FROM customers WHERE date(created_at) = ?
  `).get(yesterdayStr);

  // 3. Tính toán % tăng trưởng
  const yesterday_revenue = yesterdayStats.total_revenue || 0;
  const revenue_growth = yesterday_revenue > 0
    ? ((stats.total_revenue - yesterday_revenue) / yesterday_revenue) * 100
    : (stats.total_revenue > 0 ? 100 : 0);

  const yesterday_cust = yesterdayCustomers.count || 0;
  const customers_growth = yesterday_cust > 0
    ? ((newCustomers.count - yesterday_cust) / yesterday_cust) * 100
    : (newCustomers.count > 0 ? 100 : 0);

  return success(res, {
    ...stats,
    new_customers: newCustomers.count,
    date: todayStr,
    growth: {
      revenue: parseFloat(revenue_growth.toFixed(1)),
      customers: parseFloat(customers_growth.toFixed(1))
    }
  });
};

// GET /api/dashboard/summary?period=7|30
const summary = (req, res) => {
  const period = parseInt(req.query.period) || 7;
  
  // 1. Thống kê kỳ này
  const stats = db.prepare(`
    SELECT
      COUNT(*) as total_orders,
      COALESCE(SUM(total), 0) as total_revenue,
      COALESCE(SUM(discount_total), 0) as total_discount
    FROM orders
    WHERE created_at >= datetime('now', 'localtime', ? || ' days')
    AND payment_status = 'paid'
  `).get(`-${period}`);

  // 2. Thống kê kỳ trước (để tính tăng trưởng)
  const prevStats = db.prepare(`
    SELECT
      COUNT(*) as total_orders,
      COALESCE(SUM(total), 0) as total_revenue
    FROM orders
    WHERE created_at >= datetime('now', 'localtime', ? || ' days')
    AND created_at < datetime('now', 'localtime', ? || ' days')
    AND payment_status = 'paid'
  `).get(`-${period * 2}`, `-${period}`);

  // 3. Tính tăng trưởng tổng đơn
  const prev_orders = prevStats.total_orders || 0;
  const orders_growth = prev_orders > 0
    ? ((stats.total_orders - prev_orders) / prev_orders) * 100
    : (stats.total_orders > 0 ? 100 : 0);

  // 4. Tính tăng trưởng giá trị trung bình/đơn
  const current_avg = stats.total_orders > 0 ? stats.total_revenue / stats.total_orders : 0;
  const prev_avg = prevStats.total_orders > 0 ? prevStats.total_revenue / prevStats.total_orders : 0;
  const avg_growth = prev_avg > 0
    ? ((current_avg - prev_avg) / prev_avg) * 100
    : (current_avg > 0 ? 100 : 0);

  // Payments breakdown for Pie Chart
  const payments = db.prepare(`
    SELECT payment_method, COUNT(*) as count, COALESCE(SUM(total), 0) as total
    FROM orders
    WHERE created_at >= datetime('now', 'localtime', ? || ' days')
    AND payment_status = 'paid'
    GROUP BY payment_method
  `).all(`-${period}`);

  return success(res, {
    ...stats,
    period,
    payments,
    growth: {
      orders: parseFloat(orders_growth.toFixed(1)),
      avg_value: parseFloat(avg_growth.toFixed(1))
    }
  });
};

// GET /api/dashboard/top-products?limit=5
const topProducts = (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const products = db.prepare(`
    SELECT
      oi.product_name_snapshot as name,
      SUM(oi.quantity) as total_quantity,
      SUM(oi.subtotal) as total_revenue,
      COUNT(DISTINCT oi.order_id) as order_count
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.payment_status = 'paid'
    AND o.created_at >= datetime('now', 'localtime', '-30 days')
    GROUP BY oi.product_name_snapshot
    ORDER BY total_quantity DESC
    LIMIT ?
  `).all(limit);

  return success(res, products);
};

// GET /api/dashboard/revenue-chart?days=30
const revenueChart = (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const data = db.prepare(`
    SELECT
      date(created_at) as date,
      COUNT(*) as total_orders,
      COALESCE(SUM(total), 0) as total_revenue
    FROM orders
    WHERE created_at >= datetime('now', 'localtime', ? || ' days')
    AND payment_status = 'paid'
    GROUP BY date(created_at)
    ORDER BY date ASC
  `).all(`-${days}`);

  return success(res, data);
};

// GET /api/dashboard/staff-performance
const staffPerformance = (req, res) => {
  const staff = db.prepare(`
    SELECT 
      u.full_name,
      COUNT(o.id) as total_orders,
      COALESCE(SUM(o.total), 0) as total_sales
    FROM users u
    LEFT JOIN orders o ON o.cashier_id = u.id AND o.payment_status = 'paid' AND date(o.created_at) = date('now', 'localtime')
    WHERE u.role = 'staff'
    GROUP BY u.id
    ORDER BY total_sales DESC
  `).all();

  return success(res, staff);
};

// GET /api/dashboard/recent-orders
const recentOrders = (req, res) => {
  const orders = db.prepare(`
    SELECT o.id, o.order_code, o.total, o.payment_status, o.payment_method, o.created_at,
           u.full_name as cashier_name, c.full_name as customer_name
    FROM orders o
    LEFT JOIN users u ON o.cashier_id = u.id
    LEFT JOIN customers c ON o.customer_id = c.id
    ORDER BY o.created_at DESC
    LIMIT 10
  `).all();

  return success(res, orders);
};

module.exports = { today, summary, topProducts, revenueChart, staffPerformance, recentOrders };
