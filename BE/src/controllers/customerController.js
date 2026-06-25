'use strict';
const db = require('../config/db');
const { success, error } = require('../utils/response');
const cloudinary = require('../config/cloudinary');

const uploadToCloudinary = (buffer, folder = 'cafe-customers') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
    stream.end(buffer);
  });
};

// GET /api/customers (Admin only)
const getAll = (req, res) => {
  const { search } = req.query;
  let query = 'SELECT * FROM customers WHERE 1=1';
  const params = [];
  if (search) {
    query += ' AND (phone LIKE ? OR full_name LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  query += ' ORDER BY created_at DESC';
  const customers = db.prepare(query).all(...params);
  return success(res, customers);
};

// GET /api/customers/lookup/:phone (Staff + Admin)
const lookup = (req, res) => {
  const { phone } = req.params;
  const customer = db.prepare('SELECT * FROM customers WHERE phone = ?').get(phone);
  if (!customer) return success(res, null, 'Không tìm thấy khách hàng');
  return success(res, customer, 'Tìm thấy khách hàng');
};

// POST /api/customers
const create = async (req, res) => {
  const { phone, full_name } = req.body;
  if (!phone || !full_name) {
    return error(res, 'Vui lòng nhập số điện thoại và tên khách hàng.');
  }

  const existing = db.prepare('SELECT id FROM customers WHERE phone = ?').get(phone);
  if (existing) return error(res, 'Số điện thoại này đã tồn tại trong hệ thống.');

  let avatar_url = null;
  if (req.file) {
    try {
      const result = await uploadToCloudinary(req.file.buffer);
      avatar_url = result.secure_url;
    } catch (e) {
      return error(res, 'Tải ảnh đại diện lên thất bại.', 500);
    }
  }

  const result = db.prepare('INSERT INTO customers (phone, full_name, avatar_url) VALUES (?, ?, ?)').run(phone, full_name.trim(), avatar_url);
  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(result.lastInsertRowid);
  return success(res, customer, 'Tạo khách hàng thành công', 201);
};

// PUT /api/customers/:id (Admin only)
const update = async (req, res) => {
  const { id } = req.params;
  const { full_name, phone } = req.body;
  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
  if (!customer) return error(res, 'Không tìm thấy khách hàng.', 404);

  let avatar_url = customer.avatar_url;
  if (req.file) {
    try {
      const result = await uploadToCloudinary(req.file.buffer);
      avatar_url = result.secure_url;
    } catch (e) {
      return error(res, 'Tải ảnh đại diện lên thất bại.', 500);
    }
  }

  db.prepare(`
    UPDATE customers SET full_name = ?, phone = ?, avatar_url = ?, updated_at = datetime('now','localtime')
    WHERE id = ?
  `).run(full_name?.trim() ?? customer.full_name, phone ?? customer.phone, avatar_url, id);

  const updated = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
  return success(res, updated, 'Cập nhật khách hàng thành công');
};

// GET /api/customers/:id/orders
const getOrders = (req, res) => {
  const { id } = req.params;
  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
  if (!customer) return error(res, 'Không tìm thấy khách hàng.', 404);

  const orders = db.prepare(`
    SELECT o.*, u.full_name as cashier_name FROM orders o
    LEFT JOIN users u ON o.cashier_id = u.id
    WHERE o.customer_id = ? ORDER BY o.created_at DESC
  `).all(id);

  // Lấy items cho mỗi order
  const ordersWithItems = orders.map(order => {
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    return { ...order, items };
  });

  return success(res, { customer, orders: ordersWithItems });
};

module.exports = { getAll, lookup, create, update, getOrders };
