'use strict';
const db = require('../config/db');
const { success, error } = require('../utils/response');

// GET /api/categories
const getAll = (req, res) => {
  const categories = db.prepare(
    'SELECT * FROM categories WHERE is_deleted = 0 ORDER BY sort_order ASC, id ASC'
  ).all();
  return success(res, categories);
};

// POST /api/categories
const create = (req, res) => {
  const { name, sort_order = 0 } = req.body;
  if (!name || !name.trim()) {
    return error(res, 'Tên danh mục không được để trống.');
  }
  const stmt = db.prepare('INSERT INTO categories (name, sort_order) VALUES (?, ?)');
  const result = stmt.run(name.trim(), sort_order);
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
  return success(res, category, 'Tạo danh mục thành công', 201);
};

// PUT /api/categories/:id
const update = (req, res) => {
  const { id } = req.params;
  const { name, sort_order } = req.body;

  const category = db.prepare('SELECT * FROM categories WHERE id = ? AND is_deleted = 0').get(id);
  if (!category) return error(res, 'Không tìm thấy danh mục.', 404);

  db.prepare('UPDATE categories SET name = ?, sort_order = ? WHERE id = ?').run(
    name?.trim() ?? category.name,
    sort_order ?? category.sort_order,
    id
  );
  const updated = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  return success(res, updated, 'Cập nhật danh mục thành công');
};

// DELETE /api/categories/:id - Soft Delete
const remove = (req, res) => {
  const { id } = req.params;
  const category = db.prepare('SELECT * FROM categories WHERE id = ? AND is_deleted = 0').get(id);
  if (!category) return error(res, 'Không tìm thấy danh mục.', 404);

  db.prepare(
    "UPDATE categories SET is_deleted = 1, deleted_at = datetime('now','localtime'), deleted_by = ? WHERE id = ?"
  ).run(req.user.id, id);

  return success(res, null, 'Xóa danh mục thành công');
};

module.exports = { getAll, create, update, remove };
