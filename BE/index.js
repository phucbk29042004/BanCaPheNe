'use strict';
require('dotenv').config();
// Khởi tạo database (tạo schema nếu chưa có)
require('./src/config/db');

const app = require('./app');
const { startDailySnapshot } = require('./src/jobs/dailySnapshot');
const { startShiftReminder } = require('./src/jobs/shiftReminder');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
  console.log(`📂 Database: ${process.env.DB_PATH || './database/cafe.db'}`);
  startDailySnapshot();
  startShiftReminder();
});
