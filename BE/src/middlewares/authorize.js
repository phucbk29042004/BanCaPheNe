'use strict';
const { error } = require('../utils/response');

/**
 * Middleware phân quyền RBAC
 * @param {...string} allowedRoles - Danh sách role được phép truy cập
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'Chưa xác thực.', 401);
    }
    if (!allowedRoles.includes(req.user.role)) {
      return error(res, 'Bạn không có quyền thực hiện thao tác này.', 403);
    }
    next();
  };
};

module.exports = authorize;
