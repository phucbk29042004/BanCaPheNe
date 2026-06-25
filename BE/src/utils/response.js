'use strict';

/**
 * Chuẩn hóa response thành công
 * @param {object} res - Express response object
 * @param {any} data - Dữ liệu trả về
 * @param {string} message - Thông điệp
 * @param {number} statusCode - HTTP status code (mặc định 200)
 */
const success = (res, data = null, message = 'Thành công', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Chuẩn hóa response lỗi
 * @param {object} res - Express response object
 * @param {string} message - Thông điệp lỗi
 * @param {number} statusCode - HTTP status code (mặc định 400)
 * @param {any} errors - Chi tiết lỗi (tùy chọn)
 */
const error = (res, message = 'Có lỗi xảy ra', statusCode = 400, errors = null) => {
  const response = { success: false, message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

module.exports = { success, error };
