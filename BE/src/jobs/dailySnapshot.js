'use strict';
const cron = require('node-cron');
const db = require('../config/db');
const { getTodayString } = require('../utils/helpers');

const runDailySnapshot = () => {
  const todayStr = getTodayString();
  console.log(`[CRON] Running daily snapshot for ${todayStr}...`);

  const snapshotTx = db.transaction(() => {
    const stats = db.prepare(`
      SELECT
        COUNT(*) as total_orders,
        COALESCE(SUM(subtotal), 0) as total_revenue,
        COALESCE(SUM(discount_loyalty), 0) as total_discount_loyalty,
        COALESCE(SUM(discount_voucher), 0) as total_discount_voucher,
        COALESCE(SUM(discount_total), 0) as total_discount,
        COALESCE(SUM(total), 0) as net_revenue
      FROM orders
      WHERE date(created_at) = ? AND payment_status = 'paid'
    `).get(todayStr);

    // Upsert — idempotent
    db.prepare(`
      INSERT INTO daily_revenue_snapshots (
        snapshot_date, total_orders, total_revenue, 
        total_discount_loyalty, total_discount_voucher, total_discount, net_revenue
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(snapshot_date) DO UPDATE SET
        total_orders = excluded.total_orders,
        total_revenue = excluded.total_revenue,
        total_discount_loyalty = excluded.total_discount_loyalty,
        total_discount_voucher = excluded.total_discount_voucher,
        total_discount = excluded.total_discount,
        net_revenue = excluded.net_revenue
    `).run(
      todayStr,
      stats.total_orders,
      stats.total_revenue,
      stats.total_discount_loyalty,
      stats.total_discount_voucher,
      stats.total_discount,
      stats.net_revenue
    );

    return stats;
  });

  try {
    const result = snapshotTx();
    console.log(`[CRON] Snapshot done: ${JSON.stringify(result)}`);
  } catch (err) {
    console.error('[CRON] Snapshot failed:', err.message);
  }
};

const startDailySnapshot = () => {
  // Chạy lúc 22:00 hàng ngày
  cron.schedule('0 22 * * *', runDailySnapshot, {
    timezone: 'Asia/Ho_Chi_Minh',
  });
  console.log('[CRON] Daily snapshot job scheduled at 22:00 (Vietnam time)');
};

module.exports = { startDailySnapshot, runDailySnapshot };
