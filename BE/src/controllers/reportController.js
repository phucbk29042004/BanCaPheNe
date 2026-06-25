'use strict';
const db = require('../config/db');
const { generateExcelReport } = require('../utils/exportExcel');
const { generatePdfReport } = require('../utils/exportPdf');

const getRevenue = (req, res, next) => {
  try {
    const list = db.prepare(`
      SELECT 
        strftime('%Y-%m-%d', created_at) as date,
        COUNT(id) as total_orders,
        SUM(subtotal) as total_subtotal,
        SUM(discount_loyalty) as total_discount_loyalty,
        SUM(discount_voucher) as total_discount_voucher,
        SUM(discount_total) as total_discount,
        SUM(total) as net_revenue
      FROM orders
      WHERE payment_status = 'paid'
      GROUP BY date
      ORDER BY date DESC
    `).all();

    // Tính toán so sánh thực tế
    const stats = db.prepare(`
      SELECT
        SUM(CASE WHEN date(created_at) = date('now', 'localtime') THEN total ELSE 0 END) as today,
        SUM(CASE WHEN date(created_at) = date('now', 'localtime', '-1 day') THEN total ELSE 0 END) as yesterday,
        SUM(CASE WHEN date(created_at) >= date('now', 'localtime', 'weekday 0', '-7 days') THEN total ELSE 0 END) as this_week,
        SUM(CASE WHEN date(created_at) >= date('now', 'localtime', 'weekday 0', '-14 days') AND date(created_at) < date('now', 'localtime', 'weekday 0', '-7 days') THEN total ELSE 0 END) as last_week,
        SUM(CASE WHEN strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now', 'localtime') THEN total ELSE 0 END) as this_month,
        SUM(CASE WHEN strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now', 'localtime', '-1 month') THEN total ELSE 0 END) as last_month
      FROM orders
      WHERE payment_status = 'paid'
    `).get();

    res.json({ 
      success: true, 
      data: list,
      comparison: {
        today: stats.today || 0,
        yesterday: stats.yesterday || 0,
        this_week: stats.this_week || 0,
        last_week: stats.last_week || 0,
        this_month: stats.this_month || 0,
        last_month: stats.last_month || 0
      }
    });
  } catch (err) {
    next(err);
  }
};

const getProducts = (req, res, next) => {
  try {
    const data = db.prepare(`
      SELECT 
        oi.product_name_snapshot as name,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.subtotal) as total_revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.payment_status = 'paid'
      GROUP BY oi.product_name_snapshot
      ORDER BY total_quantity DESC
    `).all();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getStaff = (req, res, next) => {
  try {
    const data = db.prepare(`
      SELECT 
        u.full_name,
        COUNT(DISTINCT s.id) as total_shifts,
        IFNULL(SUM(a.actual_hours), 0) as total_hours,
        IFNULL(SUM(a.salary_earned), 0) as total_salary,
        IFNULL((SELECT SUM(o.total) FROM orders o WHERE o.cashier_id = u.id AND o.payment_status = 'paid'), 0) as total_sales
      FROM users u
      LEFT JOIN shifts s ON s.user_id = u.id
      LEFT JOIN attendances a ON a.shift_id = s.id AND a.check_out_time IS NOT NULL
      GROUP BY u.id
    `).all();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getCustomers = (req, res, next) => {
  try {
    const data = db.prepare(`
      SELECT full_name, phone, total_orders, total_spent 
      FROM customers 
      ORDER BY total_spent DESC
    `).all();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getVouchers = (req, res, next) => {
  try {
    const data = db.prepare(`
      SELECT 
        v.code, 
        v.type, 
        v.value, 
        v.used_count, 
        v.usage_limit,
        IFNULL(SUM(vu.discount_applied), 0) as total_discount
      FROM vouchers v
      LEFT JOIN voucher_usages vu ON vu.voucher_id = v.id
      GROUP BY v.id
      ORDER BY v.used_count DESC
    `).all();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getActivityLogs = (req, res, next) => {
  try {
    const data = db.prepare(`
      SELECT al.created_at, u.username, u.full_name, al.action, al.description
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.id DESC
    `).all();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const exportExcel = async (req, res, next) => {
  try {
    const { tab } = req.query;
    const payload = {};
    let filename = 'bao_cao_quan_ly_cafe.xlsx';

    if (!tab || tab === 'revenue') {
      payload.revenue = db.prepare(`
        SELECT strftime('%Y-%m-%d', created_at) as date, COUNT(id) as total_orders, SUM(subtotal) as total_subtotal,
               SUM(discount_loyalty) as total_discount_loyalty, SUM(discount_voucher) as total_discount_voucher,
               SUM(discount_total) as total_discount, SUM(total) as net_revenue
        FROM orders WHERE payment_status = 'paid' GROUP BY date
      `).all();
      if (tab) filename = 'bao_cao_doanh_thu.xlsx';
    }

    if (!tab || tab === 'products') {
      payload.products = db.prepare(`
        SELECT oi.product_name_snapshot as name, SUM(oi.quantity) as total_quantity, SUM(oi.subtotal) as total_revenue
        FROM order_items oi JOIN orders o ON oi.order_id = o.id
        WHERE o.payment_status = 'paid' GROUP BY oi.product_name_snapshot
      `).all();
      if (tab) filename = 'bao_cao_san_pham.xlsx';
    }

    if (!tab || tab === 'staff') {
      payload.staff = db.prepare(`
        SELECT u.full_name, COUNT(DISTINCT s.id) as total_shifts, IFNULL(SUM(a.actual_hours), 0) as total_hours,
               IFNULL(SUM(a.salary_earned), 0) as total_salary,
               IFNULL((SELECT SUM(o.total) FROM orders o WHERE o.cashier_id = u.id AND o.payment_status = 'paid'), 0) as total_sales
        FROM users u LEFT JOIN shifts s ON s.user_id = u.id
        LEFT JOIN attendances a ON a.shift_id = s.id AND a.check_out_time IS NOT NULL GROUP BY u.id
      `).all();
      if (tab) filename = 'bao_cao_nhan_vien.xlsx';
    }

    if (!tab || tab === 'customers') {
      payload.customers = db.prepare(`
        SELECT full_name, phone, total_orders, total_spent FROM customers
      `).all();
      if (tab) filename = 'bao_cao_khach_hang.xlsx';
    }

    if (!tab || tab === 'vouchers') {
      payload.vouchers = db.prepare(`
        SELECT v.code, v.type, v.value, v.used_count, v.usage_limit, IFNULL(SUM(vu.discount_applied), 0) as total_discount
        FROM vouchers v LEFT JOIN voucher_usages vu ON vu.voucher_id = v.id GROUP BY v.id
      `).all();
      if (tab) filename = 'bao_cao_khuyen_mai.xlsx';
    }

    if (!tab || tab === 'logs') {
      payload.logs = db.prepare(`
        SELECT al.created_at, u.username, u.full_name, al.action, al.description
        FROM activity_logs al LEFT JOIN users u ON al.user_id = u.id ORDER BY al.id DESC
      `).all();
      if (tab) filename = 'nhat_ky_hoat_dong.xlsx';
    }

    if (tab === 'invoices') {
      const { date_from, date_to, status, search } = req.query;
      let query = `
        SELECT o.*, u.full_name as cashier_name, c.full_name as customer_name, c.phone as customer_phone
        FROM orders o
        LEFT JOIN users u ON o.cashier_id = u.id
        LEFT JOIN customers c ON o.customer_id = c.id
        WHERE 1=1
      `;
      const params = [];
      if (date_from) { query += ' AND date(o.created_at) >= ?'; params.push(date_from); }
      if (date_to) { query += ' AND date(o.created_at) <= ?'; params.push(date_to); }
      if (status) { query += ' AND o.payment_status = ?'; params.push(status); }
      if (search) { query += ' AND o.id LIKE ?'; params.push(`%${search}%`); }
      query += ' ORDER BY o.id DESC LIMIT 1000';
      payload.invoices = db.prepare(query).all(...params);
      filename = 'danh_sach_hoa_don.xlsx';
    }

    const buffer = await generateExcelReport(payload);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(filename)}`);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};

const exportPdf = async (req, res, next) => {
  try {
    const { tab } = req.query;
    const revenue = db.prepare(`
      SELECT strftime('%Y-%m-%d', created_at) as date, COUNT(id) as total_orders, SUM(subtotal) as total_subtotal,
             SUM(discount_total) as total_discount, SUM(total) as net_revenue
      FROM orders WHERE payment_status = 'paid' GROUP BY date LIMIT 10
    `).all();

    const products = db.prepare(`
      SELECT oi.product_name_snapshot as name, '' as category_name, SUM(oi.quantity) as total_quantity, SUM(oi.subtotal) as total_revenue
      FROM order_items oi JOIN orders o ON oi.order_id = o.id
      WHERE o.payment_status = 'paid' GROUP BY oi.product_name_snapshot LIMIT 10
    `).all();

    const staff = db.prepare(`
      SELECT u.full_name, COUNT(DISTINCT s.id) as total_shifts, IFNULL(SUM(a.actual_hours), 0) as total_hours,
             IFNULL(SUM(a.salary_earned), 0) as total_salary, 0 as total_sales
      FROM users u LEFT JOIN shifts s ON s.user_id = u.id
      LEFT JOIN attendances a ON a.shift_id = s.id AND a.check_out_time IS NOT NULL GROUP BY u.id LIMIT 10
    `).all();

    const buffer = await generatePdfReport({ revenue, products, staff });
    let filename = 'bao_cao_quan_ly_cafe.pdf';
    if (tab === 'revenue') filename = 'bao_cao_doanh_thu.pdf';
    else if (tab === 'products') filename = 'bao_cao_san_pham.pdf';
    else if (tab === 'staff') filename = 'bao_cao_nhan_vien.pdf';
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(filename)}`);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};

module.exports = { getRevenue, getProducts, getStaff, getCustomers, getVouchers, getActivityLogs, exportExcel, exportPdf };
