'use strict';

/**
 * Format số tiền theo định dạng VNĐ
 * @param {number} amount
 * @returns {string}
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

/**
 * Format ngày giờ theo định dạng Việt Nam
 * @param {string|Date} date
 * @returns {string}
 */
const formatDate = (date) => {
  return new Date(date).toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Lấy ngày hôm nay theo định dạng YYYY-MM-DD
 * @returns {string}
 */
const getTodayString = () => {
  const now = new Date();
  const vnTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
  const y = vnTime.getFullYear();
  const m = String(vnTime.getMonth() + 1).padStart(2, '0');
  const d = String(vnTime.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Sinh mã đơn hàng ngẫu nhiên cho PayOS (số nguyên dương nhỏ hơn 9007199254740991)
 * @returns {number}
 */
const generateOrderCode = () => {
  return Math.floor(Math.random() * 900000) + 100000;
};

/**
 * Sinh mã hóa đơn dạng CF-YYYYMMDD-XXXX
 * @returns {string}
 */
const generateOrderCodeStr = () => {
  const now = new Date();
  const vnTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
  const y = vnTime.getFullYear();
  const m = String(vnTime.getMonth() + 1).padStart(2, '0');
  const d = String(vnTime.getDate()).padStart(2, '0');
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return `CF-${y}${m}${d}-${rand}`;
};

module.exports = { formatCurrency, formatDate, getTodayString, generateOrderCode, generateOrderCodeStr };
