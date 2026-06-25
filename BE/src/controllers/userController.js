'use strict';
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const cloudinary = require('../config/cloudinary');

const uploadToCloudinary = (buffer, folder = 'cafe-avatars') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
    stream.end(buffer);
  });
};

const getAll = (req, res, next) => {
  try {
    const users = db.prepare('SELECT id, username, full_name, role, phone, hourly_rate, avatar_url, is_active, created_at, updated_at FROM users').all();
    res.json({ success: true, data: users, message: 'Lấy danh sách nhân viên thành công.' });
  } catch (err) {
    next(err);
  }
};

const getOne = (req, res, next) => {
  try {
    const user = db.prepare('SELECT id, username, full_name, role, phone, hourly_rate, avatar_url, is_active, created_at, updated_at FROM users WHERE id = ?').get(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Nhân viên không tồn tại.' });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { username, password, full_name, role, phone, hourly_rate } = req.body;
    if (!username || !password || !full_name || !role) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ các trường bắt buộc.' });
    }

    let avatar_url = null;
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer);
        avatar_url = result.secure_url;
      } catch (e) {
        return res.status(500).json({ success: false, message: 'Tải ảnh đại diện lên thất bại.' });
      }
    }

    const hash = bcrypt.hashSync(password, 10);
    const result = db.prepare(
      'INSERT INTO users (username, password_hash, full_name, role, phone, hourly_rate, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(username, hash, full_name, role, phone || null, hourly_rate || 0.0, avatar_url);

    const newUser = db.prepare('SELECT id, username, full_name, role, phone, hourly_rate, avatar_url, is_active FROM users WHERE id = ?').get(result.lastInsertRowid);

    // Log Activity
    db.prepare('INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)')
      .run(req.user?.id || null, 'CREATE_USER', 'users', result.lastInsertRowid, `Tạo nhân viên mới: ${username} (${full_name})`);

    res.status(201).json({ success: true, data: newUser, message: 'Tạo tài khoản nhân viên thành công.' });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ success: false, message: 'Tên đăng nhập đã tồn tại.' });
    }
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { full_name, role, phone, hourly_rate, password } = req.body;
    const { id } = req.params;

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) return res.status(404).json({ success: false, message: 'Nhân viên không tồn tại.' });

    let avatar_url = user.avatar_url;
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer);
        avatar_url = result.secure_url;
      } catch (e) {
        return res.status(500).json({ success: false, message: 'Tải ảnh đại diện lên thất bại.' });
      }
    }

    let query = 'UPDATE users SET full_name = ?, role = ?, phone = ?, hourly_rate = ?, avatar_url = ?, updated_at = datetime(\'now\', \'localtime\')';
    const params = [
      full_name || user.full_name, 
      role || user.role, 
      phone || user.phone, 
      hourly_rate !== undefined ? hourly_rate : user.hourly_rate,
      avatar_url
    ];

    if (password && password.trim() !== '') {
      query += ', password_hash = ?';
      params.push(bcrypt.hashSync(password, 10));
    }

    query += ' WHERE id = ?';
    params.push(id);

    db.prepare(query).run(...params);

    // Log Activity
    db.prepare('INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)')
      .run(req.user?.id || null, 'UPDATE_USER', 'users', id, `Cập nhật thông tin nhân viên ID: ${id}`);

    const updatedUser = db.prepare('SELECT id, username, full_name, role, phone, hourly_rate, avatar_url, is_active FROM users WHERE id = ?').get(id);
    res.json({ success: true, data: updatedUser, message: 'Cập nhật thông tin thành công.' });
  } catch (err) {
    next(err);
  }
};

const toggle = (req, res, next) => {
  try {
    const { id } = req.params;
    const user = db.prepare('SELECT is_active, username FROM users WHERE id = ?').get(id);
    if (!user) return res.status(404).json({ success: false, message: 'Nhân viên không tồn tại.' });

    const newStatus = user.is_active ? 0 : 1;
    db.prepare('UPDATE users SET is_active = ?, updated_at = datetime(\'now\', \'localtime\') WHERE id = ?').run(newStatus, id);

    // Log Activity
    db.prepare('INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)')
      .run(req.user?.id || null, 'TOGGLE_USER_STATUS', 'users', id, `${newStatus ? 'Kích hoạt' : 'Khóa'} nhân viên: ${user.username}`);

    res.json({ success: true, message: `${newStatus ? 'Kích hoạt' : 'Khóa'} tài khoản thành công.` });
  } catch (err) {
    next(err);
  }
};

const getAttendances = (req, res, next) => {
  try {
    const records = db.prepare(`
      SELECT a.*, s.name as shift_name, s.date as shift_date
      FROM attendances a
      JOIN shifts s ON a.shift_id = s.id
      WHERE a.user_id = ?
      ORDER BY s.date DESC
    `).all(req.params.id);
    res.json({ success: true, data: records });
  } catch (err) {
    next(err);
  }
};

const getSalarySummary = (req, res, next) => {
  try {
    const summary = db.prepare(`
      SELECT 
        strftime('%Y-%m', s.date) as month,
        SUM(a.actual_hours) as total_hours,
        SUM(a.salary_earned) as total_salary
      FROM attendances a
      JOIN shifts s ON a.shift_id = s.id
      WHERE a.user_id = ? AND a.check_out_time IS NOT NULL
      GROUP BY month
      ORDER BY month DESC
    `).all(req.params.id);
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
};

const deleteUser = (req, res, next) => {
  try {
    const { id } = req.params;

    // Không cho phép tự xóa tài khoản của chính mình
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Bạn không thể tự xóa tài khoản của chính mình.' });
    }

    const user = db.prepare('SELECT username FROM users WHERE id = ?').get(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Tài khoản không tồn tại.' });
    }

    // Tiến hành xóa cứng
    db.prepare('DELETE FROM users WHERE id = ?').run(id);

    // Log Activity
    db.prepare('INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)')
      .run(req.user.id, 'DELETE_USER', 'users', id, `Xóa tài khoản hệ thống: ${user.username}`);

    res.json({ success: true, message: 'Xóa tài khoản thành công.' });
  } catch (err) {
    if (err.message.includes('FOREIGN KEY')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Không thể xóa tài khoản này vì đã có dữ liệu hoạt động (ca làm, hóa đơn,...) liên kết trong hệ thống. Vui lòng sử dụng chức năng Khóa tài khoản thay thế.' 
      });
    }
    next(err);
  }
};

module.exports = { getAll, getOne, create, update, toggle, getAttendances, getSalarySummary, deleteUser };

