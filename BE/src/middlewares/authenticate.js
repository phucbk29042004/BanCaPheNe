'use strict';
const jwt = require('jsonwebtoken');
const { error } = require('../utils/response');

const authenticate = (req, res, next) => {
  let token = null;
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return error(res, 'Chưa xác thực. Vui lòng đăng nhập.', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, username, role, full_name }
    next();
  } catch (err) {
    return error(res, 'Token không hợp lệ hoặc đã hết hạn.', 401);
  }
};

module.exports = authenticate;
