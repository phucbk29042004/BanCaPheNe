'use strict';
const db = require('../config/db');
const payosClient = require('../config/payos');
const { success, error } = require('../utils/response');

// POST /api/payos/webhook
const webhook = async (req, res) => {
  try {
    // Xác thực chữ ký HMAC từ PayOS
    const webhookData = await payosClient.verifyPaymentWebhookData(req.body);

    if (webhookData && webhookData.code === '00') {
      const orderCode = String(webhookData.data?.orderCode);

      const order = db.prepare('SELECT * FROM orders WHERE payos_order_code = ?').get(orderCode);
      if (order && order.payment_status === 'pending') {
        const updateTx = db.transaction(() => {
          db.prepare(`
            UPDATE orders SET payment_status = 'paid', payment_method = 'qr',
            updated_at = datetime('now','localtime') WHERE id = ?
          `).run(order.id);

          // Cập nhật thống kê khách hàng
          if (order.customer_id) {
            db.prepare(`
              UPDATE customers SET total_orders = total_orders + 1, total_spent = total_spent + ?,
              updated_at = datetime('now','localtime') WHERE id = ?
            `).run(order.total, order.customer_id);
          }
        });
        updateTx();
      }
    }

    // Trả về 200 để PayOS không gửi lại webhook
    return res.status(200).json({ success: true });
  } catch (e) {
    // Trả về 200 ngay cả khi lỗi để tránh PayOS retry loop
    return res.status(200).json({ success: false, message: e.message });
  }
};

module.exports = { webhook };
