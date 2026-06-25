'use strict';
const db = require('../config/db');

const getAll = (req, res, next) => {
  try {
    const { area, status } = req.query;
    let query = 'SELECT * FROM tables WHERE is_active = 1';
    const params = [];

    if (area) {
      query += ' AND area = ?';
      params.push(area);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY name ASC';
    const tables = db.prepare(query).all(...params);
    res.json({ success: true, data: tables });
  } catch (err) {
    next(err);
  }
};

const create = (req, res, next) => {
  try {
    const { name, area, capacity } = req.body;
    if (!name || !area) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền tên bàn và khu vực.' });
    }
    const result = db.prepare(
      'INSERT INTO tables (name, area, capacity) VALUES (?, ?, ?)'
    ).run(name, area, capacity || 2);

    const newTable = db.prepare('SELECT * FROM tables WHERE id = ?').get(result.lastInsertRowid);

    db.prepare('INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)')
      .run(req.user?.id || null, 'CREATE_TABLE', 'tables', result.lastInsertRowid, `Tạo bàn mới: ${name} (${area})`);

    res.status(201).json({ success: true, data: newTable, message: 'Thêm bàn thành công.' });
  } catch (err) {
    next(err);
  }
};

const update = (req, res, next) => {
  try {
    const { name, area, capacity } = req.body;
    const { id } = req.params;

    const table = db.prepare('SELECT * FROM tables WHERE id = ?').get(id);
    if (!table) return res.status(404).json({ success: false, message: 'Bàn không tồn tại.' });

    db.prepare(
      'UPDATE tables SET name = ?, area = ?, capacity = ? WHERE id = ?'
    ).run(name || table.name, area || table.area, capacity !== undefined ? capacity : table.capacity, id);

    db.prepare('INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)')
      .run(req.user?.id || null, 'UPDATE_TABLE', 'tables', id, `Cập nhật bàn ID: ${id}`);

    const updatedTable = db.prepare('SELECT * FROM tables WHERE id = ?').get(id);
    res.json({ success: true, data: updatedTable, message: 'Cập nhật thông tin bàn thành công.' });
  } catch (err) {
    next(err);
  }
};

const toggleStatus = (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status || !['available', 'occupied', 'reserved'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ.' });
    }

    const table = db.prepare('SELECT * FROM tables WHERE id = ?').get(id);
    if (!table) return res.status(404).json({ success: false, message: 'Bàn không tồn tại.' });

    db.prepare('UPDATE tables SET status = ? WHERE id = ?').run(status, id);

    res.json({ success: true, message: 'Cập nhật trạng thái bàn thành công.' });
  } catch (err) {
    next(err);
  }
};

const remove = (req, res, next) => {
  try {
    const { id } = req.params;
    const table = db.prepare('SELECT * FROM tables WHERE id = ?').get(id);
    if (!table) return res.status(404).json({ success: false, message: 'Bàn không tồn tại.' });

    db.prepare('UPDATE tables SET is_active = 0 WHERE id = ?').run(id);

    db.prepare('INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)')
      .run(req.user?.id || null, 'DELETE_TABLE', 'tables', id, `Xóa bàn ID: ${id}`);

    res.json({ success: true, message: 'Xóa bàn thành công.' });
  } catch (err) {
    next(err);
  }
};

const getCurrentOrder = (req, res, next) => {
  try {
    const order = db.prepare(`
      SELECT * FROM orders 
      WHERE table_id = ? AND payment_status = 'pending' 
      ORDER BY id DESC LIMIT 1
    `).get(req.params.id);

    if (!order) {
      return res.json({ success: true, data: null, message: 'Bàn hiện đang trống.' });
    }

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    res.json({ success: true, data: { order, items } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, create, update, toggleStatus, remove, getCurrentOrder };
