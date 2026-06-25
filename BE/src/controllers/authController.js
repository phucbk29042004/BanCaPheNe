'use strict';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { success, error } = require('../utils/response');

// POST /api/auth/login
const login = (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return error(res, 'Vui lòng nhập tên đăng nhập và mật khẩu.', 400);
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ? AND is_active = 1').get(username);
  if (!user) {
    return error(res, 'Tên đăng nhập hoặc mật khẩu không đúng.', 401);
  }

  const isMatch = bcrypt.compareSync(password, user.password_hash);
  if (!isMatch) {
    return error(res, 'Tên đăng nhập hoặc mật khẩu không đúng.', 401);
  }

  const payload = { id: user.id, username: user.username, role: user.role, full_name: user.full_name };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

  return success(res, { token, user: payload }, 'Đăng nhập thành công');
};

// POST /api/auth/logout
const logout = (req, res) => {
  // JWT stateless - client tự xóa token
  return success(res, null, 'Đăng xuất thành công');
};

// GET /api/auth/me
const me = (req, res) => {
  return success(res, req.user, 'Lấy thông tin người dùng thành công');
};

module.exports = { login, logout, me };
