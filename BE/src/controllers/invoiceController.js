'use strict';
const db = require('../config/db');
const { success, error } = require('../utils/response');
const { formatCurrency, formatDate } = require('../utils/helpers');

// GET /api/invoices
const getAll = (req, res) => {
  const { date_from, date_to, status, cashier_id, search } = req.query;

  let query = `
    SELECT o.*, u.full_name as cashier_name, c.full_name as customer_name, c.phone as customer_phone
    FROM orders o
    LEFT JOIN users u ON o.cashier_id = u.id
    LEFT JOIN customers c ON o.customer_id = c.id
    WHERE 1=1
  `;
  const params = [];

  // Staff chỉ thấy hóa đơn ca mình
  if (req.user.role === 'staff') {
    query += ' AND o.cashier_id = ?';
    params.push(req.user.id);
  }

  if (date_from) { query += ' AND date(o.created_at) >= ?'; params.push(date_from); }
  if (date_to) { query += ' AND date(o.created_at) <= ?'; params.push(date_to); }
  if (status) { query += ' AND o.payment_status = ?'; params.push(status); }
  if (cashier_id && req.user.role === 'admin') { query += ' AND o.cashier_id = ?'; params.push(cashier_id); }
  if (search) { query += ' AND o.id LIKE ?'; params.push(`%${search}%`); }

  query += ' ORDER BY o.id DESC LIMIT 200';

  const invoices = db.prepare(query).all(...params);
  return success(res, invoices);
};

// GET /api/invoices/:id/print
const print = (req, res) => {
  const { id } = req.params;
  const order = db.prepare(`
    SELECT o.*, u.full_name as cashier_name, c.full_name as customer_name, c.phone as customer_phone
    FROM orders o
    LEFT JOIN users u ON o.cashier_id = u.id
    LEFT JOIN customers c ON o.customer_id = c.id
    WHERE o.id = ?
  `).get(id);

  if (!order) return error(res, 'Không tìm thấy hóa đơn.', 404);

  // Staff chỉ in hóa đơn ca mình
  if (req.user.role === 'staff' && order.cashier_id !== req.user.id) {
    return error(res, 'Bạn không có quyền in hóa đơn này.', 403);
  }

  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id);

  const itemsHtml = items.map(item => `
    <tr>
      <td>${item.product_name_snapshot}</td>
      <td style="text-align:center">${item.quantity}</td>
      <td style="text-align:right">${formatCurrency(item.unit_price_snapshot)}</td>
      <td style="text-align:right">${formatCurrency(item.subtotal)}</td>
    </tr>
  `).join('');

  const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Hóa đơn #${order.id}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Courier New', monospace; font-size: 13px; padding: 20px; max-width: 320px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 16px; }
    .header h1 { font-size: 18px; margin-bottom: 4px; }
    .header p { font-size: 11px; color: #666; }
    .divider { border-top: 1px dashed #ccc; margin: 12px 0; }
    .info { margin-bottom: 12px; }
    .info p { margin-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 4px 2px; border-bottom: 1px solid #ccc; font-size: 11px; }
    td { padding: 4px 2px; vertical-align: top; }
    .totals { margin-top: 12px; }
    .totals p { display: flex; justify-content: space-between; margin-bottom: 4px; }
    .totals .grand-total { font-weight: bold; font-size: 15px; border-top: 2px solid #000; padding-top: 6px; margin-top: 6px; }
    .footer { text-align: center; margin-top: 16px; font-size: 11px; color: #666; }
    .status-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
    .status-paid { background: #dcfce7; color: #166534; }
    .status-pending { background: #fef9c3; color: #854d0e; }
    .status-cancelled { background: #fee2e2; color: #991b1b; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>☕ QUÁN CÀ PHÊ</h1>
    <p>Hóa đơn thanh toán</p>
  </div>
  <div class="divider"></div>
  <div class="info">
    <p><strong>Mã HĐ:</strong> #${String(order.id).padStart(6, '0')}</p>
    <p><strong>Ngày:</strong> ${formatDate(order.created_at)}</p>
    <p><strong>Thu ngân:</strong> ${order.cashier_name}</p>
    ${order.customer_name ? `<p><strong>Khách hàng:</strong> ${order.customer_name} (${order.customer_phone})</p>` : ''}
    <p>
      <strong>Trạng thái:</strong>
      <span class="status-badge status-${order.payment_status}">
        ${order.payment_status === 'paid' ? '✓ Đã thanh toán' : order.payment_status === 'pending' ? '⏳ Chờ thanh toán' : '✗ Đã hủy'}
      </span>
    </p>
    ${order.payment_status === 'cancelled' && order.cancel_reason ? `<p><strong>Lý do hủy:</strong> ${order.cancel_reason}</p>` : ''}
  </div>
  <div class="divider"></div>
  <table>
    <thead>
      <tr>
        <th>Sản phẩm</th>
        <th style="text-align:center">SL</th>
        <th style="text-align:right">Đơn giá</th>
        <th style="text-align:right">Thành tiền</th>
      </tr>
    </thead>
    <tbody>${itemsHtml}</tbody>
  </table>
  <div class="divider"></div>
  <div class="totals">
    <p><span>Tạm tính:</span> <span>${formatCurrency(order.subtotal)}</span></p>
    ${order.discount_amount > 0 ? `<p><span>Giảm giá (${order.discount_type === 'loyalty' ? 'KH thân thiết' : ''}):</span> <span>-${formatCurrency(order.discount_amount)}</span></p>` : ''}
    <p class="grand-total"><span>TỔNG CỘNG:</span> <span>${formatCurrency(order.total)}</span></p>
    <p><span>Thanh toán:</span> <span>${order.payment_method === 'cash' ? 'Tiền mặt' : 'Chuyển khoản QR'}</span></p>
  </div>
  <div class="divider"></div>
  <div class="footer">
    <p>Cảm ơn quý khách!</p>
    <p>Hẹn gặp lại ☕</p>
  </div>
  <script>window.onload = () => window.print();</script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.send(html);
};

module.exports = { getAll, print };
