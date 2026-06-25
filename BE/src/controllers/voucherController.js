'use strict';
const db = require('../config/db');

const getAll = (req, res, next) => {
  try {
    const { is_active, type } = req.query;
    let query = 'SELECT * FROM vouchers WHERE 1 = 1';
    const params = [];

    if (is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(parseInt(is_active));
    }
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY created_at DESC';
    const vouchers = db.prepare(query).all(...params);
    res.json({ success: true, data: vouchers });
  } catch (err) {
    next(err);
  }
};

const create = (req, res, next) => {
  try {
    const { code, description, type, value, min_order_amount, max_discount_amount, usage_limit, valid_from, valid_until } = req.body;
    if (!code || !type || value === undefined || !valid_from || !valid_until) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ các thông tin bắt buộc.' });
    }

    const result = db.prepare(`
      INSERT INTO vouchers (code, description, type, value, min_order_amount, max_discount_amount, usage_limit, valid_from, valid_until, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      code.toUpperCase(),
      description || null,
      type,
      value,
      min_order_amount || 0,
      max_discount_amount || null,
      usage_limit || null,
      valid_from,
      valid_until,
      req.user?.id || null
    );

    const newVoucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(result.lastInsertRowid);

    db.prepare('INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)')
      .run(req.user?.id || null, 'CREATE_VOUCHER', 'vouchers', result.lastInsertRowid, `Tạo mã voucher mới: ${code}`);

    res.status(201).json({ success: true, data: newVoucher, message: 'Tạo voucher thành công.' });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ success: false, message: 'Mã voucher đã tồn tại.' });
    }
    next(err);
  }
};

const update = (req, res, next) => {
  try {
    const { description, type, value, min_order_amount, max_discount_amount, usage_limit, valid_from, valid_until } = req.body;
    const { id } = req.params;

    const voucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);
    if (!voucher) return res.status(404).json({ success: false, message: 'Mã voucher không tồn tại.' });

    db.prepare(`
      UPDATE vouchers 
      SET description = ?, type = ?, value = ?, min_order_amount = ?, max_discount_amount = ?, usage_limit = ?, valid_from = ?, valid_until = ?
      WHERE id = ?
    `).run(
      description || voucher.description,
      type || voucher.type,
      value !== undefined ? value : voucher.value,
      min_order_amount !== undefined ? min_order_amount : voucher.min_order_amount,
      max_discount_amount !== undefined ? max_discount_amount : voucher.max_discount_amount,
      usage_limit !== undefined ? usage_limit : voucher.usage_limit,
      valid_from || voucher.valid_from,
      valid_until || voucher.valid_until,
      id
    );

    db.prepare('INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)')
      .run(req.user?.id || null, 'UPDATE_VOUCHER', 'vouchers', id, `Cập nhật voucher ID: ${id}`);

    const updatedVoucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);
    res.json({ success: true, data: updatedVoucher, message: 'Cập nhật voucher thành công.' });
  } catch (err) {
    next(err);
  }
};

const toggle = (req, res, next) => {
  try {
    const { id } = req.params;
    const voucher = db.prepare('SELECT is_active, code FROM vouchers WHERE id = ?').get(id);
    if (!voucher) return res.status(404).json({ success: false, message: 'Voucher không tồn tại.' });

    const newStatus = voucher.is_active ? 0 : 1;
    db.prepare('UPDATE vouchers SET is_active = ? WHERE id = ?').run(newStatus, id);

    db.prepare('INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)')
      .run(req.user?.id || null, 'TOGGLE_VOUCHER', 'vouchers', id, `${newStatus ? 'Bật' : 'Tắt'} voucher: ${voucher.code}`);

    res.json({ success: true, message: `${newStatus ? 'Bật' : 'Tắt'} voucher thành công.` });
  } catch (err) {
    next(err);
  }
};

const remove = (req, res, next) => {
  try {
    const { id } = req.params;
    const voucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);
    if (!voucher) return res.status(404).json({ success: false, message: 'Voucher không tồn tại.' });

    db.prepare('UPDATE vouchers SET is_active = 0 WHERE id = ?').run(id);

    db.prepare('INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)')
      .run(req.user?.id || null, 'DELETE_VOUCHER', 'vouchers', id, `Xóa voucher ID: ${id}`);

    res.json({ success: true, message: 'Xóa voucher thành công (Xóa mềm).' });
  } catch (err) {
    next(err);
  }
};

const validate = (req, res, next) => {
  try {
    const { code } = req.params;
    const amount = parseFloat(req.query.amount || 0);

    const voucher = db.prepare('SELECT * FROM vouchers WHERE code = ? AND is_active = 1').get(code.toUpperCase());
    if (!voucher) {
      return res.status(400).json({ success: false, message: 'Mã giảm giá không hợp lệ hoặc đã bị khóa.' });
    }

    const nowStr = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).substring(0, 19).replace(' ', 'T');
    if (nowStr < voucher.valid_from) {
      return res.status(400).json({ success: false, message: 'Mã giảm giá chưa bắt đầu thời hạn sử dụng.' });
    }
    if (nowStr > voucher.valid_until) {
      return res.status(400).json({ success: false, message: 'Mã giảm giá đã hết hạn sử dụng.' });
    }

    if (voucher.usage_limit !== null && voucher.used_count >= voucher.usage_limit) {
      return res.status(400).json({ success: false, message: 'Mã giảm giá đã hết lượt sử dụng.' });
    }

    if (amount < voucher.min_order_amount) {
      return res.status(400).json({ 
        success: false, 
        message: `Đơn hàng tối thiểu phải từ ${voucher.min_order_amount.toLocaleString()}đ để áp dụng voucher.` 
      });
    }

    let discount = 0;
    if (voucher.type === 'percent') {
      discount = (voucher.value / 100) * amount;
      if (voucher.max_discount_amount) {
        discount = Math.min(discount, voucher.max_discount_amount);
      }
    } else {
      discount = voucher.value;
    }

    res.json({ success: true, data: { voucher, discount }, message: 'Áp dụng mã giảm giá thành công.' });
  } catch (err) {
    next(err);
  }
};

const getUsages = (req, res, next) => {
  try {
    const usages = db.prepare(`
      SELECT vu.*, o.order_code, c.full_name as customer_name
      FROM voucher_usages vu
      JOIN orders o ON vu.order_id = o.id
      LEFT JOIN customers c ON vu.customer_id = c.id
      WHERE vu.voucher_id = ?
      ORDER BY vu.used_at DESC
    `).all(req.params.id);
    res.json({ success: true, data: usages });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, create, update, toggle, remove, validate, getUsages };
