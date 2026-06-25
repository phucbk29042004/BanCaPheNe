'use strict';
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Xóa file database cũ để SQLite chạy lại migrations tạo cấu trúc mới
const dbPath = path.resolve(process.env.DB_PATH || './database/cafe.db');
if (fs.existsSync(dbPath)) {
  try {
    fs.unlinkSync(dbPath);
    // Xóa các file log phụ của SQLite WAL mode nếu có
    if (fs.existsSync(dbPath + '-wal')) fs.unlinkSync(dbPath + '-wal');
    if (fs.existsSync(dbPath + '-shm')) fs.unlinkSync(dbPath + '-shm');
    console.log('🗑️ Đã xóa file database cũ để cấu trúc lại schema mới.');
  } catch (err) {
    console.warn('⚠️ Không thể xóa file database cũ (có thể đang bị khóa bởi process khác):', err.message);
  }
}

const bcrypt = require('bcryptjs');
const db = require('./src/config/db');

console.log('🌱 Bắt đầu seed dữ liệu mẫu nâng cao...');

const seed = db.transaction(() => {
  // Xóa dữ liệu cũ
  db.exec(`
    DELETE FROM order_items;
    DELETE FROM orders;
    DELETE FROM voucher_usages;
    DELETE FROM vouchers;
    DELETE FROM customers;
    DELETE FROM attendances;
    DELETE FROM shifts;
    DELETE FROM tables;
    DELETE FROM products;
    DELETE FROM categories;
    DELETE FROM activity_logs;
    DELETE FROM users;
    DELETE FROM daily_revenue_snapshots;
  `);

  // 1. Tạo Users
  const adminHash = bcrypt.hashSync('Admin@123', 10);
  const staffHash = bcrypt.hashSync('Staff@123', 10);

  const adminResult = db.prepare(`
    INSERT INTO users (username, password_hash, full_name, role, phone, hourly_rate)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('admin', adminHash, 'Nguyễn Quản Lý', 'admin', '0912345678', 0.0);

  const staff1Result = db.prepare(`
    INSERT INTO users (username, password_hash, full_name, role, phone, hourly_rate)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('staff1', staffHash, 'Trần Thu Ngân', 'staff', '0987654321', 25000.0);

  const staff2Result = db.prepare(`
    INSERT INTO users (username, password_hash, full_name, role, phone, hourly_rate)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('staff2', staffHash, 'Lê Pha Chế', 'staff', '0933333333', 28000.0);

  console.log('✅ Tạo tài khoản: admin / Admin@123, staff1 / Staff@123, staff2 / Staff@123');

  // 2. Tạo Categories
  const cat1 = db.prepare('INSERT INTO categories (name, sort_order) VALUES (?, ?)').run('Cà Phê', 1).lastInsertRowid;
  const cat2 = db.prepare('INSERT INTO categories (name, sort_order) VALUES (?, ?)').run('Trà Trái Cây', 2).lastInsertRowid;
  const cat3 = db.prepare('INSERT INTO categories (name, sort_order) VALUES (?, ?)').run('Nước Ép Nguyên Chất', 3).lastInsertRowid;
  const cat4 = db.prepare('INSERT INTO categories (name, sort_order) VALUES (?, ?)').run('Đồ Ăn Nhẹ', 4).lastInsertRowid;
  console.log('✅ Tạo 4 danh mục');

  // 3. Tạo Products
  const products = [
    { name: 'Cà Phê Đen Đá', category_id: cat1, price: 22000, description: 'Cà phê đen pha phin truyền thống' },
    { name: 'Cà Phê Sữa Đá', category_id: cat1, price: 26000, description: 'Cà phê sữa đá béo ngọt' },
    { name: 'Bạc Xỉu Sài Gòn', category_id: cat1, price: 29000, description: 'Sữa đặc pha cà phê thơm béo' },
    { name: 'Espresso Double', category_id: cat1, price: 35000, description: 'Cà phê máy đậm đà chuẩn Ý' },
    { name: 'Trà Đào Cam Sả', category_id: cat2, price: 39000, description: 'Trà đào thanh ngọt kèm cam sả tươi' },
    { name: 'Trà Vải Sen Gold', category_id: cat2, price: 42000, description: 'Trà vải thơm mát, hạt sen bùi ngậy' },
    { name: 'Trà Dâu Đông Du', category_id: cat2, price: 35000, description: 'Trà dâu tây Đà Lạt chua ngọt' },
    { name: 'Nước Ép Dưa Hấu', category_id: cat3, price: 32000, description: 'Dưa hấu đỏ nguyên chất thanh nhiệt' },
    { name: 'Nước Ép Thơm Tươi', category_id: cat3, price: 35000, description: 'Nước ép quả dứa giàu vitamin C' },
    { name: 'Nước Ép Cam Tép', category_id: cat3, price: 38000, description: 'Cam sành vắt nguyên chất ngọt mát' },
    { name: 'Bánh Croissant Bơ Pháp', category_id: cat4, price: 30000, description: 'Bánh sừng bò ngập hương bơ thơm' },
    { name: 'Bánh Mì Kẹp Pate', category_id: cat4, price: 25000, description: 'Bánh mì nóng kẹp pate thơm ngon' },
    { name: 'Hướng Dương Rang Cát', category_id: cat4, price: 15000, description: 'Hạt hướng dương thơm giòn rụm' },
    { name: 'Khô Gà Lá Chanh', category_id: cat4, price: 28000, description: 'Khô gà xé cay nồng thơm lá chanh' },
    { name: 'Tiramisu Cacao', category_id: cat4, price: 45000, description: 'Bánh kem Tiramisu chuẩn vị Ý' }
  ];

  const insertProduct = db.prepare('INSERT INTO products (name, category_id, price, description) VALUES (?, ?, ?, ?)');
  for (const p of products) {
    insertProduct.run(p.name, p.category_id, p.price, p.description);
  }
  console.log('✅ Tạo 15 sản phẩm mẫu');

  // 4. Tạo Tables
  const tableData = [
    { name: 'Bàn 1 (Sảnh)', area: 'indoor', capacity: 2 },
    { name: 'Bàn 2 (Sảnh)', area: 'indoor', capacity: 4 },
    { name: 'Bàn 3 (Cửa Sổ)', area: 'indoor', capacity: 2 },
    { name: 'Bàn Ngoài Trời 1', area: 'outdoor', capacity: 4 },
    { name: 'Bàn Ngoài Trời 2', area: 'outdoor', capacity: 6 },
    { name: 'Phòng VIP 1', area: 'vip', capacity: 8 },
    { name: 'Phòng VIP 2', area: 'vip', capacity: 10 },
    { name: 'Bàn Quầy Bar', area: 'indoor', capacity: 2 }
  ];

  const insertTable = db.prepare('INSERT INTO tables (name, area, capacity) VALUES (?, ?, ?)');
  for (const t of tableData) {
    insertTable.run(t.name, t.area, t.capacity);
  }
  console.log('✅ Tạo 8 bàn chia 3 khu vực');

  // 5. Tạo Vouchers
  const insertVoucher = db.prepare(`
    INSERT INTO vouchers (code, description, type, value, min_order_amount, max_discount_amount, usage_limit, valid_from, valid_until, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const v1 = insertVoucher.run('GIAM10', 'Giảm 10% cho đơn từ 100k', 'percent', 10, 100000, 30000, 50, '2026-01-01T00:00:00', '2027-12-31T23:59:59', adminResult.lastInsertRowid).lastInsertRowid;
  const v2 = insertVoucher.run('KM50K', 'Giảm trực tiếp 50k đơn từ 200k', 'fixed', 50000, 200000, null, 20, '2026-01-01T00:00:00', '2027-12-31T23:59:59', adminResult.lastInsertRowid).lastInsertRowid;
  const v3 = insertVoucher.run('EXPIRED', 'Voucher hết hạn sử dụng', 'fixed', 20000, 50000, null, 10, '2026-01-01T00:00:00', '2026-05-01T00:00:00', adminResult.lastInsertRowid).lastInsertRowid;
  console.log('✅ Tạo 3 mã voucher mẫu');

  // 6. Tạo Khách hàng
  const c1 = db.prepare("INSERT INTO customers (phone, full_name, total_orders, total_spent) VALUES ('0900000001', 'Trần Văn A', 3, 180000)").run().lastInsertRowid;
  const c2 = db.prepare("INSERT INTO customers (phone, full_name, total_orders, total_spent) VALUES ('0900000002', 'Lê Thị B', 1, 95000)").run().lastInsertRowid;
  console.log('✅ Tạo khách hàng mẫu');

  // 7. Tạo ca làm việc mẫu
  const insertShift = db.prepare(`
    INSERT INTO shifts (name, date, start_time, end_time, user_id, assigned_by, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const todayStr = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).substring(0, 10);
  insertShift.run('ca_sang', todayStr, '06:00:00', '14:00:00', staff1Result.lastInsertRowid, adminResult.lastInsertRowid, 'active');
  insertShift.run('ca_chieu', todayStr, '14:00:00', '22:00:00', staff2Result.lastInsertRowid, adminResult.lastInsertRowid, 'scheduled');
  console.log('✅ Phân ca làm việc mẫu hôm nay');

  // 8. Tạo đơn hàng 7 ngày qua (để dashboard có biểu đồ)
  const insertOrder = db.prepare(`
    INSERT INTO orders (
      order_code, table_id, customer_id, cashier_id, shift_id,
      subtotal, voucher_id, discount_loyalty, discount_voucher, discount_total,
      total, payment_method, payment_status, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'paid', ?, ?)
  `);

  const insertOrderItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, product_name_snapshot, unit_price_snapshot, quantity, subtotal)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (let i = 6; i >= 0; i--) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - i);
    const dateStr = targetDate.toLocaleString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).substring(0, 10);
    const dtStr = `${dateStr} 15:30:00`;

    // 2 đơn hàng mỗi ngày
    const subtotal1 = 120000;
    const loyalty1 = 12000;
    const total1 = 108000;
    const code1 = `CF-${dateStr.replace(/-/g, '')}-100${i}`;
    const orderId1 = insertOrder.run(code1, 1, c1, staff1Result.lastInsertRowid, null, subtotal1, null, loyalty1, 0, loyalty1, total1, 'cash', dtStr, dtStr).lastInsertRowid;
    insertOrderItem.run(orderId1, 1, 'Cà Phê Đen Đá', 22000, 2, 44000);
    insertOrderItem.run(orderId1, 2, 'Cà Phê Sữa Đá', 26000, 2, 52000);
    insertOrderItem.run(orderId1, 11, 'Bánh Croissant Bơ Pháp', 30000, 1, 30000);

    const subtotal2 = 65000;
    const total2 = 65000;
    const code2 = `CF-${dateStr.replace(/-/g, '')}-200${i}`;
    const orderId2 = insertOrder.run(code2, 2, null, staff1Result.lastInsertRowid, null, subtotal2, null, 0, 0, 0, total2, 'qr', dtStr, dtStr).lastInsertRowid;
    insertOrderItem.run(orderId2, 5, 'Trà Đào Cam Sả', 39000, 1, 39000);
    insertOrderItem.run(orderId2, 2, 'Cà Phê Sữa Đá', 26000, 1, 26000);

    // Snapshot doanh thu cho ngày này
    db.prepare(`
      INSERT INTO daily_revenue_snapshots (
        snapshot_date, total_orders, total_revenue, 
        total_discount_loyalty, total_discount_voucher, total_discount, net_revenue
      ) VALUES (?, 2, ?, ?, 0, ?, ?)
    `).run(dateStr, subtotal1 + subtotal2, loyalty1, loyalty1, total1 + total2);
  }

  console.log('✅ Seed 14 đơn hàng mẫu và snapshots doanh thu 7 ngày');
});

try {
  seed();
  console.log('\n🎉 Seed dữ liệu mẫu hoàn tất thành công!');
  console.log('   👤 Admin:  admin / Admin@123');
  console.log('   👤 Staff:  staff1 / Staff@123');
} catch (err) {
  console.error('❌ Seed thất bại:', err.message);
  process.exit(1);
}
