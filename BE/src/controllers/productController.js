'use strict';
const db = require('../config/db');
const cloudinary = require('../config/cloudinary');
const { success, error } = require('../utils/response');

// Helper: upload buffer lên Cloudinary
const uploadToCloudinary = (buffer, folder = 'cafe-products') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
    stream.end(buffer);
  });
};

// GET /api/products
const getAll = (req, res) => {
  const { category_id, is_available, search } = req.query;
  let query = `
    SELECT p.*, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_deleted = 0
  `;
  const params = [];

  if (category_id) { query += ' AND p.category_id = ?'; params.push(category_id); }
  if (is_available !== undefined) { query += ' AND p.is_available = ?'; params.push(is_available === 'true' ? 1 : 0); }
  if (search) { query += ' AND p.name LIKE ?'; params.push(`%${search}%`); }

  query += ' ORDER BY p.created_at DESC';
  const products = db.prepare(query).all(...params);
  return success(res, products);
};

// GET /api/products/:id
const getOne = (req, res) => {
  const product = db.prepare(`
    SELECT p.*, c.name as category_name FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ? AND p.is_deleted = 0
  `).get(req.params.id);
  if (!product) return error(res, 'Không tìm thấy sản phẩm.', 404);
  return success(res, product);
};

// POST /api/products
const create = async (req, res) => {
  const { name, category_id, price, description } = req.body;
  if (!name || !category_id || !price) {
    return error(res, 'Vui lòng nhập đầy đủ thông tin sản phẩm.');
  }

  let image_url = null;
  if (req.file) {
    try {
      const result = await uploadToCloudinary(req.file.buffer);
      image_url = result.secure_url;
    } catch (e) {
      return error(res, 'Tải ảnh lên thất bại.', 500);
    }
  }

  const stmt = db.prepare(`
    INSERT INTO products (name, category_id, price, image_url, description)
    VALUES (?, ?, ?, ?, ?)
  `);
  const result = stmt.run(name.trim(), category_id, parseFloat(price), image_url, description || null);
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
  return success(res, product, 'Tạo sản phẩm thành công', 201);
};

// PUT /api/products/:id
const update = async (req, res) => {
  const { id } = req.params;
  const product = db.prepare('SELECT * FROM products WHERE id = ? AND is_deleted = 0').get(id);
  if (!product) return error(res, 'Không tìm thấy sản phẩm.', 404);

  const { name, category_id, price, description, is_available } = req.body;
  let image_url = product.image_url;

  if (req.file) {
    try {
      const result = await uploadToCloudinary(req.file.buffer);
      image_url = result.secure_url;
    } catch (e) {
      return error(res, 'Tải ảnh lên thất bại.', 500);
    }
  }

  db.prepare(`
    UPDATE products SET name = ?, category_id = ?, price = ?, image_url = ?,
    description = ?, is_available = ?, updated_at = datetime('now','localtime')
    WHERE id = ?
  `).run(
    name?.trim() ?? product.name,
    category_id ?? product.category_id,
    price ? parseFloat(price) : product.price,
    image_url,
    description ?? product.description,
    is_available !== undefined ? (is_available === 'true' || is_available === true ? 1 : 0) : product.is_available,
    id
  );
  const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  return success(res, updated, 'Cập nhật sản phẩm thành công');
};

// DELETE /api/products/:id - Soft Delete
const remove = (req, res) => {
  const { id } = req.params;
  const product = db.prepare('SELECT * FROM products WHERE id = ? AND is_deleted = 0').get(id);
  if (!product) return error(res, 'Không tìm thấy sản phẩm.', 404);

  db.prepare(`
    UPDATE products SET is_deleted = 1, deleted_at = datetime('now','localtime'), deleted_by = ?
    WHERE id = ?
  `).run(req.user.id, id);
  return success(res, null, 'Xóa sản phẩm thành công');
};

// PATCH /api/products/:id/toggle
const toggle = (req, res) => {
  const { id } = req.params;
  const product = db.prepare('SELECT * FROM products WHERE id = ? AND is_deleted = 0').get(id);
  if (!product) return error(res, 'Không tìm thấy sản phẩm.', 404);

  const newStatus = product.is_available ? 0 : 1;
  db.prepare("UPDATE products SET is_available = ?, updated_at = datetime('now','localtime') WHERE id = ?")
    .run(newStatus, id);
  return success(res, { is_available: newStatus }, `Sản phẩm đã được ${newStatus ? 'bật' : 'tắt'} bán`);
};

module.exports = { getAll, getOne, create, update, remove, toggle };
