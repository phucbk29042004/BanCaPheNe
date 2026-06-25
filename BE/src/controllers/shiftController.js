'use strict';
const db = require('../config/db');

// --- Shifts Management ---
const getAll = (req, res, next) => {
  try {
    const { date, user_id, status } = req.query;
    let query = `
      SELECT s.*, u.full_name as employee_name, s.assigned_by, ab.full_name as assigner_name
      FROM shifts s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN users ab ON s.assigned_by = ab.id
      WHERE 1 = 1
    `;
    const params = [];

    if (date) {
      query += ' AND s.date = ?';
      params.push(date);
    }
    if (user_id) {
      query += ' AND s.user_id = ?';
      params.push(user_id);
    }
    if (status) {
      query += ' AND s.status = ?';
      params.push(status);
    }

    query += ' ORDER BY s.date DESC, s.start_time ASC';
    const shifts = db.prepare(query).all(...params);
    res.json({ success: true, data: shifts });
  } catch (err) {
    next(err);
  }
};

const getOne = (req, res, next) => {
  try {
    const shift = db.prepare('SELECT * FROM shifts WHERE id = ?').get(req.params.id);
    if (!shift) return res.status(404).json({ success: false, message: 'Ca làm việc không tồn tại.' });
    res.json({ success: true, data: shift });
  } catch (err) {
    next(err);
  }
};

const create = (req, res, next) => {
  try {
    const { name, date, start_time, end_time, user_id } = req.body;
    if (!name || !date || !start_time || !end_time || !user_id) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ các thông tin.' });
    }

    // Check for double shifts on the same day for that employee
    const overlap = db.prepare('SELECT COUNT(*) as count FROM shifts WHERE user_id = ? AND date = ?').get(user_id, date);
    if (overlap.count > 0) {
      return res.status(400).json({ success: false, message: 'Nhân viên này đã được phân ca trong ngày hôm đó.' });
    }

    const result = db.prepare(`
      INSERT INTO shifts (name, date, start_time, end_time, user_id, assigned_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name, date, start_time, end_time, user_id, req.user?.id || null);

    const newShift = db.prepare('SELECT * FROM shifts WHERE id = ?').get(result.lastInsertRowid);

    db.prepare('INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)')
      .run(req.user?.id || null, 'CREATE_SHIFT', 'shifts', result.lastInsertRowid, `Phân ca làm cho NV ID: ${user_id} ngày ${date}`);

    res.status(201).json({ success: true, data: newShift, message: 'Phân ca thành công.' });
  } catch (err) {
    next(err);
  }
};

const update = (req, res, next) => {
  try {
    const { name, date, start_time, end_time, user_id, status } = req.body;
    const { id } = req.params;

    const shift = db.prepare('SELECT * FROM shifts WHERE id = ?').get(id);
    if (!shift) return res.status(404).json({ success: false, message: 'Ca làm việc không tồn tại.' });

    db.prepare(`
      UPDATE shifts 
      SET name = ?, date = ?, start_time = ?, end_time = ?, user_id = ?, status = ?
      WHERE id = ?
    `).run(
      name || shift.name,
      date || shift.date,
      start_time || shift.start_time,
      end_time || shift.end_time,
      user_id || shift.user_id,
      status || shift.status,
      id
    );

    res.json({ success: true, message: 'Cập nhật ca làm thành công.' });
  } catch (err) {
    next(err);
  }
};

const remove = (req, res, next) => {
  try {
    const { id } = req.params;
    const shift = db.prepare('SELECT * FROM shifts WHERE id = ?').get(id);
    if (!shift) return res.status(404).json({ success: false, message: 'Ca làm việc không tồn tại.' });

    db.prepare('DELETE FROM shifts WHERE id = ?').run(id);

    db.prepare('INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)')
      .run(req.user?.id || null, 'DELETE_SHIFT', 'shifts', id, `Xóa ca làm ID: ${id}`);

    res.json({ success: true, message: 'Xóa ca làm thành công.' });
  } catch (err) {
    next(err);
  }
};

const getToday = (req, res, next) => {
  try {
    const today = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).substring(0, 10);
    const shift = db.prepare(`
      SELECT s.*, a.check_in_time, a.check_out_time, a.id as attendance_id
      FROM shifts s
      LEFT JOIN attendances a ON s.id = a.shift_id AND a.user_id = s.user_id
      WHERE s.user_id = ? AND s.date = ?
      LIMIT 1
    `).get(req.user.id, today);

    res.json({ success: true, data: shift || null });
  } catch (err) {
    next(err);
  }
};

// --- Attendance (Chấm công) ---
const checkIn = (req, res, next) => {
  try {
    const { shift_id } = req.body;
    if (!shift_id) return res.status(400).json({ success: false, message: 'Vui lòng cung cấp ID ca làm việc.' });

    const shift = db.prepare('SELECT * FROM shifts WHERE id = ?').get(shift_id);
    if (!shift) return res.status(404).json({ success: false, message: 'Ca làm việc không tồn tại.' });

    if (shift.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Bạn không được phân công làm ca này.' });
    }

    const exist = db.prepare('SELECT id FROM attendances WHERE shift_id = ? AND user_id = ?').get(shift_id, req.user.id);
    if (exist) {
      return res.status(400).json({ success: false, message: 'Bạn đã check-in cho ca này rồi.' });
    }

    const checkInTime = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).substring(11, 19);

    // Calculate late minutes
    const shiftStartParts = shift.start_time.split(':');
    const checkInParts = checkInTime.split(':');
    const shiftStartMin = parseInt(shiftStartParts[0]) * 60 + parseInt(shiftStartParts[1]);
    const checkInMin = parseInt(checkInParts[0]) * 60 + parseInt(checkInParts[1]);
    const lateMinutes = Math.max(0, checkInMin - shiftStartMin);

    db.transaction(() => {
      db.prepare(`
        INSERT INTO attendances (shift_id, user_id, check_in_time, late_minutes)
        VALUES (?, ?, ?, ?)
      `).run(shift_id, req.user.id, checkInTime, lateMinutes);

      db.prepare("UPDATE shifts SET status = 'active' WHERE id = ?").run(shift_id);
    })();

    res.json({ success: true, message: `Check-in thành công. Đi muộn: ${lateMinutes} phút.` });
  } catch (err) {
    next(err);
  }
};

const checkOut = (req, res, next) => {
  try {
    const { shift_id, note } = req.body;
    if (!shift_id) return res.status(400).json({ success: false, message: 'Vui lòng cung cấp ID ca làm việc.' });

    const attendance = db.prepare('SELECT * FROM attendances WHERE shift_id = ? AND user_id = ?').get(shift_id, req.user.id);
    if (!attendance) {
      return res.status(400).json({ success: false, message: 'Bạn chưa check-in cho ca này.' });
    }
    if (attendance.check_out_time) {
      return res.status(400).json({ success: false, message: 'Bạn đã check-out ca này rồi.' });
    }

    const checkOutTime = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).substring(11, 19);
    const user = db.prepare('SELECT hourly_rate FROM users WHERE id = ?').get(req.user.id);

    // Calculate actual hours
    const inParts = attendance.check_in_time.split(':');
    const outParts = checkOutTime.split(':');
    const inMin = parseInt(inParts[0]) * 60 + parseInt(inParts[1]);
    const outMin = parseInt(outParts[0]) * 60 + parseInt(outParts[1]);
    const actualHours = Math.max(0, (outMin - inMin) / 60);
    const salary = actualHours * user.hourly_rate;

    db.transaction(() => {
      db.prepare(`
        UPDATE attendances 
        SET check_out_time = ?, actual_hours = ?, salary_earned = ?, note = ?
        WHERE id = ?
      `).run(checkOutTime, actualHours, salary, note || null, attendance.id);

      db.prepare("UPDATE shifts SET status = 'completed' WHERE id = ?").run(shift_id);
    })();

    res.json({ success: true, message: `Check-out thành công. Thời gian làm: ${actualHours.toFixed(2)} giờ. Lương nhận: ${salary.toLocaleString()}đ.` });
  } catch (err) {
    next(err);
  }
};

const getAttendances = (req, res, next) => {
  try {
    const records = db.prepare(`
      SELECT a.*, u.full_name as employee_name, s.name as shift_name, s.date as shift_date
      FROM attendances a
      JOIN users u ON a.user_id = u.id
      JOIN shifts s ON a.shift_id = s.id
      ORDER BY s.date DESC
    `).all();
    res.json({ success: true, data: records });
  } catch (err) {
    next(err);
  }
};

const getMyAttendances = (req, res, next) => {
  try {
    const records = db.prepare(`
      SELECT a.*, s.name as shift_name, s.date as shift_date
      FROM attendances a
      JOIN shifts s ON a.shift_id = s.id
      WHERE a.user_id = ?
      ORDER BY s.date DESC
    `).all(req.user.id);
    res.json({ success: true, data: records });
  } catch (err) {
    next(err);
  }
};

const editAttendance = (req, res, next) => {
  try {
    const { check_in_time, check_out_time, actual_hours, salary_earned, note } = req.body;
    const { id } = req.params;

    const att = db.prepare('SELECT * FROM attendances WHERE id = ?').get(id);
    if (!att) return res.status(404).json({ success: false, message: 'Bản ghi chấm công không tồn tại.' });

    db.prepare(`
      UPDATE attendances
      SET check_in_time = ?, check_out_time = ?, actual_hours = ?, salary_earned = ?, note = ?
      WHERE id = ?
    `).run(
      check_in_time || att.check_in_time,
      check_out_time || att.check_out_time,
      actual_hours !== undefined ? actual_hours : att.actual_hours,
      salary_earned !== undefined ? salary_earned : att.salary_earned,
      note !== undefined ? note : att.note,
      id
    );

    res.json({ success: true, message: 'Chỉnh sửa chấm công thành công.' });
  } catch (err) {
    next(err);
  }
};

const getSalarySummary = (req, res, next) => {
  try {
    const summary = db.prepare(`
      SELECT 
        u.id as user_id,
        u.full_name,
        u.role,
        SUM(a.actual_hours) as total_hours,
        SUM(a.salary_earned) as total_salary
      FROM users u
      LEFT JOIN attendances a ON u.id = a.user_id
      LEFT JOIN shifts s ON a.shift_id = s.id
      WHERE a.check_out_time IS NOT NULL
      GROUP BY u.id
      ORDER BY total_salary DESC
    `).all();
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
};

module.exports = { 
  getAll, getOne, create, update, remove, getToday, 
  checkIn, checkOut, getAttendances, getMyAttendances, editAttendance, getSalarySummary 
};
