'use strict';
const cron = require('node-cron');
const db = require('../config/db');
const { getTodayString } = require('../utils/helpers');

const runShiftReminder = () => {
  const todayStr = getTodayString();
  console.log(`[CRON] Running shift reminder job for ${todayStr}...`);

  try {
    const shiftsToday = db.prepare(`
      SELECT s.*, u.full_name as employee_name
      FROM shifts s
      JOIN users u ON s.user_id = u.id
      WHERE s.date = ?
    `).all(todayStr);

    if (shiftsToday.length > 0) {
      shiftsToday.forEach(shift => {
        db.prepare(`
          INSERT INTO activity_logs (action, description)
          VALUES (?, ?)
        `).run('SHIFT_REMINDER', `Nhắc nhở: Nhân viên ${shift.employee_name} có ca làm việc [${shift.name}] hôm nay từ ${shift.start_time} đến ${shift.end_time}`);
      });
      console.log(`[CRON] Shift reminders logged: ${shiftsToday.length} shifts.`);
    } else {
      console.log('[CRON] No shifts scheduled for today.');
    }
  } catch (err) {
    console.error('[CRON] Shift reminder failed:', err.message);
  }
};

const startShiftReminder = () => {
  // Chạy lúc 06:00 hàng ngày
  cron.schedule('0 6 * * *', runShiftReminder, {
    timezone: 'Asia/Ho_Chi_Minh',
  });
  console.log('[CRON] Shift reminder job scheduled at 06:00 (Vietnam time)');
};

module.exports = { startShiftReminder, runShiftReminder };
