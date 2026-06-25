'use strict';
require('dotenv').config();
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(process.env.DB_PATH || './database/cafe.db');
const dbDir = path.dirname(dbPath);

// Tạo thư mục database nếu chưa tồn tại
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Bật WAL mode và foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Tự động kiểm tra và thêm cột avatar_url nếu cơ sở dữ liệu cũ chưa có
try {
  const userColumns = db.prepare("PRAGMA table_info(users)").all();
  if (!userColumns.some(col => col.name === 'avatar_url')) {
    db.prepare("ALTER TABLE users ADD COLUMN avatar_url TEXT").run();
    console.log("Đã thêm cột avatar_url vào bảng users");
  }
} catch (e) {
  console.error("Lỗi khi thêm cột avatar_url vào bảng users:", e.message);
}

try {
  const customerColumns = db.prepare("PRAGMA table_info(customers)").all();
  if (!customerColumns.some(col => col.name === 'avatar_url')) {
    db.prepare("ALTER TABLE customers ADD COLUMN avatar_url TEXT").run();
    console.log("Đã thêm cột avatar_url vào bảng customers");
  }
} catch (e) {
  console.error("Lỗi khi thêm cột avatar_url vào bảng customers:", e.message);
}

// Khởi tạo schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'staff')),
    phone TEXT,
    avatar_url TEXT,
    hourly_rate REAL NOT NULL DEFAULT 0.0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_deleted INTEGER NOT NULL DEFAULT 0,
    deleted_at TEXT,
    deleted_by INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    price REAL NOT NULL,
    image_url TEXT,
    description TEXT,
    is_available INTEGER NOT NULL DEFAULT 1,
    is_deleted INTEGER NOT NULL DEFAULT 0,
    deleted_at TEXT,
    deleted_by INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS tables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    area TEXT NOT NULL CHECK(area IN ('indoor', 'outdoor', 'vip')),
    capacity INTEGER NOT NULL DEFAULT 2,
    status TEXT NOT NULL DEFAULT 'available' CHECK(status IN ('available', 'occupied', 'reserved')),
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    total_orders INTEGER NOT NULL DEFAULT 0,
    total_spent REAL NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS vouchers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    type TEXT NOT NULL CHECK(type IN ('percent', 'fixed')),
    value REAL NOT NULL,
    min_order_amount REAL NOT NULL DEFAULT 0,
    max_discount_amount REAL,
    usage_limit INTEGER,
    used_count INTEGER NOT NULL DEFAULT 0,
    valid_from TEXT NOT NULL,
    valid_until TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_by INTEGER REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS shifts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL CHECK(name IN ('ca_sang', 'ca_chieu', 'ca_toi')),
    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id),
    assigned_by INTEGER REFERENCES users(id),
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'active', 'completed')),
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS attendances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shift_id INTEGER NOT NULL REFERENCES shifts(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    check_in_time TEXT,
    check_out_time TEXT,
    actual_hours REAL DEFAULT 0,
    late_minutes INTEGER DEFAULT 0,
    salary_earned REAL DEFAULT 0,
    note TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_code TEXT NOT NULL UNIQUE,
    table_id INTEGER REFERENCES tables(id),
    customer_id INTEGER REFERENCES customers(id),
    cashier_id INTEGER NOT NULL REFERENCES users(id),
    shift_id INTEGER REFERENCES shifts(id),
    subtotal REAL NOT NULL,
    voucher_id INTEGER REFERENCES vouchers(id),
    discount_loyalty REAL NOT NULL DEFAULT 0,
    discount_voucher REAL NOT NULL DEFAULT 0,
    discount_total REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL,
    payment_method TEXT NOT NULL CHECK(payment_method IN ('cash', 'qr')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK(payment_status IN ('pending', 'paid', 'cancelled')),
    payos_order_code TEXT,
    cancel_reason TEXT,
    cancelled_by INTEGER REFERENCES users(id),
    note TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    product_name_snapshot TEXT NOT NULL,
    unit_price_snapshot REAL NOT NULL,
    quantity INTEGER NOT NULL,
    subtotal REAL NOT NULL,
    note TEXT
  );

  CREATE TABLE IF NOT EXISTS voucher_usages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    voucher_id INTEGER NOT NULL REFERENCES vouchers(id),
    order_id INTEGER NOT NULL REFERENCES orders(id),
    customer_id INTEGER REFERENCES customers(id),
    discount_applied REAL NOT NULL,
    used_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS daily_revenue_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    snapshot_date TEXT NOT NULL UNIQUE,
    total_orders INTEGER NOT NULL DEFAULT 0,
    total_revenue REAL NOT NULL DEFAULT 0,
    total_discount_loyalty REAL NOT NULL DEFAULT 0,
    total_discount_voucher REAL NOT NULL DEFAULT 0,
    total_discount REAL NOT NULL DEFAULT 0,
    net_revenue REAL NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id INTEGER,
    description TEXT,
    ip_address TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );
`);

module.exports = db;
