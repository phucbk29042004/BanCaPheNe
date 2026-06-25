'use strict';
const db = require('../config/db');
const payosClient = require('../config/payos');
const { success, error } = require('../utils/response');
const { generateOrderCode, generateOrderCodeStr } = require('../utils/helpers');

// POST /api/orders - Tạo đơn hàng mới (Dine-in/POS Transaction)
const create = (req, res) => {
  const { customer_id, table_id, voucher_code, items, payment_method, note } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return error(res, 'Đơn hàng phải có ít nhất một sản phẩm.');
  }
  if (!['cash', 'qr'].includes(payment_method)) {
    return error(res, 'Phương thức thanh toán không hợp lệ.');
  }

  const createOrder = db.transaction(() => {
    // 1. Kiểm tra bàn nếu chọn bàn
    if (table_id) {
      const table = db.prepare('SELECT status, is_active FROM tables WHERE id = ?').get(table_id);
      if (!table || !table.is_active) throw new Error('Bàn không tồn tại hoặc đã bị khóa.');
      if (table.status === 'occupied') throw new Error('Bàn này đang có khách, không thể đặt đơn mới.');
    }

    // 2. Tính tổng tiền tạm tính và lưu snapshots
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = db.prepare('SELECT * FROM products WHERE id = ? AND is_deleted = 0 AND is_available = 1').get(item.product_id);
      if (!product) throw new Error(`Sản phẩm ID ${item.product_id} không tồn tại hoặc đã ngừng bán.`);
      if (!item.quantity || item.quantity < 1) throw new Error('Số lượng sản phẩm không hợp lệ.');

      const isSizeL = item.size === 'L';
      const unitPrice = isSizeL ? product.price + 10000 : product.price;
      const itemSubtotal = unitPrice * item.quantity;
      subtotal += itemSubtotal;
      orderItems.push({
        product_id: product.id,
        product_name_snapshot: isSizeL ? `${product.name} (Size L)` : `${product.name} (Size M)`,
        unit_price_snapshot: unitPrice,
        quantity: item.quantity,
        subtotal: itemSubtotal,
        note: item.note || null
      });
    }

    // 3. Tính giảm giá Loyalty (10%)
    let discount_loyalty = 0;
    if (customer_id) {
      const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(customer_id);
      if (customer) {
        discount_loyalty = Math.round(subtotal * 0.1);
      }
    }

    const subtotalAfterLoyalty = subtotal - discount_loyalty;

    // 4. Áp dụng Voucher (nếu có)
    let discount_voucher = 0;
    let voucherId = null;

    if (voucher_code) {
      const voucher = db.prepare('SELECT * FROM vouchers WHERE code = ? AND is_active = 1').get(voucher_code.toUpperCase());
      if (!voucher) throw new Error('Mã giảm giá không hợp lệ hoặc đã bị khóa.');

      const nowStr = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).substring(0, 19).replace(' ', 'T');
      if (nowStr < voucher.valid_from) throw new Error('Mã giảm giá chưa đến hạn sử dụng.');
      if (nowStr > voucher.valid_until) throw new Error('Mã giảm giá đã hết hạn sử dụng.');
      if (voucher.usage_limit !== null && voucher.used_count >= voucher.usage_limit) {
        throw new Error('Mã giảm giá đã hết lượt sử dụng.');
      }
      if (subtotalAfterLoyalty < voucher.min_order_amount) {
        throw new Error(`Đơn hàng phải từ ${voucher.min_order_amount.toLocaleString()}đ để áp dụng voucher.`);
      }

      voucherId = voucher.id;
      if (voucher.type === 'percent') {
        discount_voucher = (voucher.value / 100) * subtotalAfterLoyalty;
        if (voucher.max_discount_amount) {
          discount_voucher = Math.min(discount_voucher, voucher.max_discount_amount);
        }
      } else {
        discount_voucher = voucher.value;
      }
      discount_voucher = Math.round(discount_voucher);
    }

    const discount_total = discount_loyalty + discount_voucher;
    const total = Math.max(0, subtotal - discount_total);

    // Lấy ca làm việc hiện tại của cashier (nếu có)
    const today = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).substring(0, 10);
    const currentShift = db.prepare('SELECT id FROM shifts WHERE user_id = ? AND date = ? AND status = \'active\' LIMIT 1').get(req.user.id, today);
    const shiftId = currentShift ? currentShift.id : null;

    // Sinh mã đơn hàng
    const orderCodeStr = generateOrderCodeStr();

    // 5. Thêm đơn hàng vào bảng orders
    const orderResult = db.prepare(`
      INSERT INTO orders (
        order_code, table_id, customer_id, cashier_id, shift_id, 
        subtotal, voucher_id, discount_loyalty, discount_voucher, discount_total, 
        total, payment_method, payment_status, note
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `).run(
      orderCodeStr,
      table_id || null,
      customer_id || null,
      req.user.id,
      shiftId,
      subtotal,
      voucherId,
      discount_loyalty,
      discount_voucher,
      discount_total,
      total,
      payment_method,
      note || null
    );

    const orderId = orderResult.lastInsertRowid;

    // 6. Thêm chi tiết món
    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, product_name_snapshot, unit_price_snapshot, quantity, subtotal, note)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const item of orderItems) {
      insertItem.run(orderId, item.product_id, item.product_name_snapshot, item.unit_price_snapshot, item.quantity, item.subtotal, item.note);
    }

    // 7. Cập nhật lượt dùng voucher nếu có
    if (voucherId) {
      db.prepare('UPDATE vouchers SET used_count = used_count + 1 WHERE id = ?').run(voucherId);
      db.prepare(`
        INSERT INTO voucher_usages (voucher_id, order_id, customer_id, discount_applied)
        VALUES (?, ?, ?, ?)
      `).run(voucherId, orderId, customer_id || null, discount_voucher);
    }

    // 8. Chuyển trạng thái bàn sang occupied
    if (table_id) {
      db.prepare("UPDATE tables SET status = 'occupied' WHERE id = ?").run(table_id);
    }

    // Ghi nhật ký
    db.prepare('INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)')
      .run(req.user.id, 'CREATE_ORDER', 'orders', orderId, `Tạo đơn hàng mới: ${orderCodeStr} (Tổng: ${total.toLocaleString()}đ)`);

    return db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  });

  try {
    const order = createOrder();
    const items_data = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    return success(res, { ...order, items: items_data }, 'Tạo đơn hàng thành công', 201);
  } catch (e) {
    return error(res, e.message || 'Tạo đơn hàng thất bại.');
  }
};

// GET /api/orders
const getAll = (req, res) => {
  let query = `
    SELECT o.*, u.full_name as cashier_name, c.full_name as customer_name, c.phone as customer_phone, t.name as table_name
    FROM orders o
    LEFT JOIN users u ON o.cashier_id = u.id
    LEFT JOIN customers c ON o.customer_id = c.id
    LEFT JOIN tables t ON o.table_id = t.id
    WHERE 1=1
  `;
  const params = [];

  // Staff chỉ thấy đơn của mình
  if (req.user.role === 'staff') {
    query += ' AND o.cashier_id = ?';
    params.push(req.user.id);
  }

  query += ' ORDER BY o.id DESC LIMIT 100';
  const orders = db.prepare(query).all(...params);
  return success(res, orders);
};

// GET /api/orders/:id
const getOne = (req, res) => {
  const order = db.prepare(`
    SELECT o.*, u.full_name as cashier_name, c.full_name as customer_name, c.phone as customer_phone, t.name as table_name
    FROM orders o
    LEFT JOIN users u ON o.cashier_id = u.id
    LEFT JOIN customers c ON o.customer_id = c.id
    LEFT JOIN tables t ON o.table_id = t.id
    WHERE o.id = ?
  `).get(req.params.id);

  if (!order) return error(res, 'Không tìm thấy đơn hàng.', 404);

  // Staff chỉ xem đơn của mình
  if (req.user.role === 'staff' && order.cashier_id !== req.user.id) {
    return error(res, 'Bạn không có quyền xem đơn hàng này.', 403);
  }

  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  return success(res, { ...order, items });
};

// PATCH /api/orders/:id/cancel
const cancel = (req, res) => {
  const { id } = req.params;
  const { cancel_reason } = req.body;

  if (!cancel_reason || !cancel_reason.trim()) {
    return error(res, 'Vui lòng nhập lý do hủy đơn.');
  }

  const cancelOrder = db.transaction(() => {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    if (!order) throw new Error('Không tìm thấy đơn hàng.');
    
    // Admin hoặc chính cashier của đơn mới được hủy đơn pending. 
    // Đơn paid chỉ Admin được hủy.
    if (order.payment_status === 'paid') {
      if (req.user.role !== 'admin') {
        throw new Error('Chỉ có Quản lý (Admin) mới có quyền hủy hóa đơn đã thanh toán.');
      }
    } else if (order.payment_status === 'pending') {
      if (req.user.role !== 'admin' && order.cashier_id !== req.user.id) {
        throw new Error('Bạn không có quyền hủy đơn hàng này.');
      }
    } else {
      throw new Error('Hóa đơn đã bị hủy trước đó.');
    }

    // Cập nhật trạng thái đơn hàng
    db.prepare(`
      UPDATE orders SET payment_status = 'cancelled', cancel_reason = ?, cancelled_by = ?, updated_at = datetime('now','localtime')
      WHERE id = ?
    `).run(cancel_reason.trim(), req.user.id, id);

    // Giải phóng bàn
    if (order.table_id) {
      db.prepare("UPDATE tables SET status = 'available' WHERE id = ?").run(order.table_id);
    }

    // Hoàn lượt dùng voucher
    if (order.voucher_id) {
      db.prepare('UPDATE vouchers SET used_count = MAX(0, used_count - 1) WHERE id = ?').run(order.voucher_id);
      db.prepare('DELETE FROM voucher_usages WHERE order_id = ?').run(id);
    }

    // Nếu đơn hàng đã thanh toán (paid), cần hoàn trả chi tiêu cho khách hàng
    if (order.payment_status === 'paid' && order.customer_id) {
      db.prepare(`
        UPDATE customers 
        SET total_orders = MAX(0, total_orders - 1), 
            total_spent = MAX(0, total_spent - ?),
            updated_at = datetime('now','localtime') 
        WHERE id = ?
      `).run(order.total, order.customer_id);
    }

    // Ghi nhật ký
    db.prepare('INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)')
      .run(req.user.id, 'CANCEL_ORDER', 'orders', id, `Hủy đơn hàng: ${order.order_code}. Lý do: ${cancel_reason}`);

    return db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  });

  try {
    const order = cancelOrder();
    return success(res, order, 'Hủy đơn hàng thành công');
  } catch (e) {
    return error(res, e.message);
  }
};

// POST /api/orders/:id/pay-cash
const payCash = (req, res) => {
  const { id } = req.params;

  const payCashTx = db.transaction(() => {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    if (!order) throw new Error('Không tìm thấy đơn hàng.');
    if (order.payment_status !== 'pending') throw new Error('Đơn hàng này không ở trạng thái chờ thanh toán.');

    db.prepare(`
      UPDATE orders SET payment_status = 'paid', payment_method = 'cash', updated_at = datetime('now','localtime')
      WHERE id = ?
    `).run(id);

    // Cập nhật thống kê chi tiêu khách hàng thân thiết
    if (order.customer_id) {
      db.prepare(`
        UPDATE customers SET total_orders = total_orders + 1, total_spent = total_spent + ?,
        updated_at = datetime('now','localtime') WHERE id = ?
      `).run(order.total, order.customer_id);
    }

    // Ghi nhật ký
    db.prepare('INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)')
      .run(req.user.id, 'PAY_CASH', 'orders', id, `Thanh toán tiền mặt cho đơn hàng: ${order.order_code}`);

    return db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  });

  try {
    const order = payCashTx();
    return success(res, order, 'Thanh toán tiền mặt thành công');
  } catch (e) {
    return error(res, e.message);
  }
};

function cleanDescription(str) {
  if (!str) return 'Thanh toan hoa don';
  
  // Loại bỏ dấu tiếng Việt
  const signedChars = "àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ";
  const unsignedChars = "aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyydAAAAAAAAAAAAAAAAAEEEEEEEEEEEIIIIIOOOOOOOOOOOOOOOOOUUUUUUUUUUUYYYYYD";
  
  let result = str;
  for (let i = 0; i < signedChars.length; i++) {
    const reg = new RegExp(signedChars[i], "g");
    result = result.replace(reg, unsignedChars[i]);
  }
  
  // Chỉ giữ lại chữ, số và khoảng trắng
  result = result.replace(/[^a-zA-Z0-9 ]/g, '');
  
  // Rút gọn còn tối đa 25 ký tự
  return result.trim().substring(0, 25);
}

// POST /api/orders/:id/pay-qr
const payQR = async (req, res) => {
  const { id } = req.params;
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);

  if (!order) return error(res, 'Không tìm thấy đơn hàng.', 404);
  if (order.payment_status !== 'pending') return error(res, 'Đơn hàng này không ở trạng thái chờ thanh toán.');

  try {
    const orderCode = generateOrderCode();
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id);

    const descRaw = `Thanh toan don ${order.order_code}`;
    const cleanedDesc = cleanDescription(descRaw);

    const paymentData = {
      orderCode,
      amount: Math.round(order.total),
      description: cleanedDesc,
      items: items.map(i => ({
        name: cleanDescription(i.product_name_snapshot.substring(0, 25)),
        quantity: i.quantity,
        price: Math.round(i.unit_price_snapshot),
      })),
      returnUrl: `${process.env.PAYOS_WEBHOOK_URL || 'http://localhost:3000'}/#pos`,
      cancelUrl: `${process.env.PAYOS_WEBHOOK_URL || 'http://localhost:3000'}/#pos`,
    };

    const paymentLink = await payosClient.createPaymentLink(paymentData);

    // Lưu mã PayOS vào đơn hàng
    db.prepare("UPDATE orders SET payos_order_code = ?, updated_at = datetime('now','localtime') WHERE id = ?")
      .run(String(orderCode), id);

    return success(res, { checkoutUrl: paymentLink.checkoutUrl, orderCode }, 'Tạo link thanh toán QR thành công');
  } catch (e) {
    console.error('[PayOS Error]', e);
    return error(res, 'Không thể tạo link thanh toán. Vui lòng thử lại.', 500);
  }
};

// DELETE /api/orders/:id (Xóa cứng đơn hàng nháp chưa thanh toán)
const deleteOrder = (req, res) => {
  const { id } = req.params;

  const deleteTx = db.transaction(() => {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    if (!order) throw new Error('Không tìm thấy đơn hàng.');
    if (order.payment_status !== 'pending') throw new Error('Chỉ có thể xóa đơn hàng chưa thanh toán.');

    // Xóa order_items
    db.prepare('DELETE FROM order_items WHERE order_id = ?').run(id);

    // Giải phóng bàn nếu có
    if (order.table_id) {
      db.prepare("UPDATE tables SET status = 'available' WHERE id = ?").run(order.table_id);
    }

    // Hoàn lượt dùng voucher nếu có
    if (order.voucher_id) {
      db.prepare('UPDATE vouchers SET used_count = MAX(0, used_count - 1) WHERE id = ?').run(order.voucher_id);
      db.prepare('DELETE FROM voucher_usages WHERE order_id = ?').run(id);
    }

    // Xóa order
    db.prepare('DELETE FROM orders WHERE id = ?').run(id);

    // Ghi nhật ký
    db.prepare('INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)')
      .run(req.user.id, 'DELETE_ORDER', 'orders', id, `Xóa đơn hàng nháp: ${order.order_code}`);
  });

  try {
    deleteTx();
    return success(res, null, 'Xóa đơn hàng nháp thành công');
  } catch (e) {
    return error(res, e.message);
  }
};

module.exports = { create, getAll, getOne, cancel, payCash, payQR, deleteOrder };

