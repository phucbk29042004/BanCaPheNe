/**
 * dashboard.js — View Dashboard (Admin only)
 */
import { api } from '../api.js';
import { Toast } from '../components/toast.js';
import { Pagination } from '../components/pagination.js';

const IcoTrophy = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--warning);"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"/><path d="M12 2a6 6 0 0 0-6 6v1c0 2.2 1.8 4 4 4h4c2.2 0 4-1.8 4-4V8a6 6 0 0 0-6-6z"/></svg>`;

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n || 0);
const fmtCurrency = (n) => new Intl.NumberFormat('vi-VN').format(n || 0) + ' VNĐ';
const fmtDate = (d) => {
  if (!d) return '';
  const date = new Date(d);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

let chartInstance = null;

export const render = () => `
<div class="page">
  <!-- Period Filter Toolbar -->
  <div class="toolbar" style="margin-bottom:8px; display:flex; justify-content:flex-end; gap:8px;">
    <button class="btn btn-secondary btn-sm period-pill active" data-period="7">7 ngày</button>
    <button class="btn btn-secondary btn-sm period-pill" data-period="30">30 ngày</button>
  </div>

  <!-- Stats Cards -->
  <div class="stats-grid" id="stats-grid">
    <div class="stat-card" id="card-revenue" style="cursor:pointer;">
      <div class="stat-icon orange">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
      </div>
      <div class="stat-content">
        <div class="stat-label">Doanh thu hôm nay</div>
        <div class="stat-value" id="stat-revenue">—</div>
        <div class="stat-sub" id="stat-orders">— đơn hàng</div>
        <div class="stat-growth" id="growth-revenue" style="display:inline-flex; align-items:center;">
          <!-- Tỷ lệ tăng trưởng thực tế -->
        </div>
      </div>
    </div>
    <div class="stat-card" id="card-period-orders" style="cursor:pointer;">
      <div class="stat-icon green">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
      </div>
      <div class="stat-content">
        <div class="stat-label">Tổng đơn (kỳ)</div>
        <div class="stat-value" id="stat-period-orders">—</div>
        <div class="stat-sub" id="stat-period-label">đơn hàng</div>
        <div class="stat-growth" id="growth-orders" style="display:inline-flex; align-items:center;">
          <!-- Tỷ lệ tăng trưởng thực tế -->
        </div>
      </div>
    </div>
    <div class="stat-card" id="card-avg" style="cursor:pointer;">
      <div class="stat-icon blue">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
      </div>
      <div class="stat-content">
        <div class="stat-label">Trung bình / đơn</div>
        <div class="stat-value" id="stat-avg">—</div>
        <div class="stat-sub">trên mỗi đơn thành công</div>
        <div class="stat-growth" id="growth-avg" style="display:inline-flex; align-items:center;">
          <!-- Tỷ lệ tăng trưởng thực tế -->
        </div>
      </div>
    </div>
    <div class="stat-card" id="card-new-customers" style="cursor:pointer;">
      <div class="stat-icon purple">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </div>
      <div class="stat-content">
        <div class="stat-label">Khách mới hôm nay</div>
        <div class="stat-value" id="stat-new-customers">—</div>
        <div class="stat-sub">khách hàng mới</div>
        <div class="stat-growth" id="growth-customers" style="display:inline-flex; align-items:center;">
          <!-- Tỷ lệ tăng trưởng thực tế -->
        </div>
      </div>
    </div>
  </div>

  <!-- Charts & Top Products -->
  <div class="dashboard-grid">
    <div class="chart-card">
      <div class="chart-header">
        <h3 class="chart-title">Biểu đồ doanh thu</h3>
      </div>
      <div class="chart-container">
        <canvas id="revenue-chart"></canvas>
      </div>
    </div>

    <div class="chart-card">
      <div class="chart-header">
        <h3 class="chart-title">Top sản phẩm</h3>
      </div>
      <div class="top-products-list" id="top-products">
        <div class="empty-state"><div class="icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg></div><p>Đang tải...</p></div>
      </div>
    </div>
  </div>

  <!-- Recent Orders -->
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">Đơn hàng gần nhất</h3>
    </div>
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Khách hàng</th>
            <th>Thu ngân</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th>Thời gian</th>
          </tr>
        </thead>
        <tbody id="recent-orders-tbody">
          <tr><td colspan="6" class="text-center text-muted" style="padding:24px">Đang tải...</td></tr>
        </tbody>
      </table>
    </div>
    <div id="dashboard-pagination-container"></div>
  </div>
</div>
`;

const statusBadge = (status) => {
  const map = {
    paid:      '<span class="badge badge-success">✓ Đã TT</span>',
    pending:   '<span class="badge badge-warning">Chờ</span>',
    cancelled: '<span class="badge badge-danger">✗ Hủy</span>',
  };
  return map[status] || status;
};

// Render Badge Tăng Trưởng
const renderGrowthBadge = (containerId, val, compareText) => {
  const el = document.getElementById(containerId);
  if (!el) return;

  if (val === undefined || val === null) {
    el.innerHTML = '';
    return;
  }

  const isUp = val >= 0;
  const colorClass = isUp ? 'success' : 'danger';
  const prefix = isUp ? '+' : '';
  const arrowSvg = isUp
    ? `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="vertical-align:middle;margin-right:2px"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`
    : `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="vertical-align:middle;margin-right:2px"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>`;

  el.className = `stat-growth ${colorClass}`;
  el.innerHTML = `
    ${arrowSvg}
    <span>${prefix}${val}%</span> <span class="growth-text" style="margin-left:4px">${compareText}</span>
  `;
};

const loadStats = async () => {
  const todayRes = await api.get('/api/dashboard/today').catch(() => null);

  if (todayRes?.success) {
    const d = todayRes.data;
    document.getElementById('stat-revenue').textContent = fmtCurrency(d.total_revenue);
    document.getElementById('stat-orders').textContent = `${fmt(d.total_orders)} đơn hàng`;
    document.getElementById('stat-new-customers').textContent = fmt(d.new_customers);
    
    // Tỉ lệ tăng trưởng động từ database
    renderGrowthBadge('growth-revenue', d.growth?.revenue, 'vs hôm qua');
    renderGrowthBadge('growth-customers', d.growth?.customers, 'vs hôm qua');
  }
};

const loadPeriodStats = async (period) => {
  const res = await api.get(`/api/dashboard/summary?period=${period}`).catch(() => null);
  if (res?.success) {
    const d = res.data;
    document.getElementById('stat-period-orders').textContent = fmt(d.total_orders);
    document.getElementById('stat-period-label').textContent = `đơn trong ${period} ngày`;
    const avg = d.total_orders > 0 ? d.total_revenue / d.total_orders : 0;
    document.getElementById('stat-avg').textContent = fmtCurrency(avg);

    // Tỉ lệ tăng trưởng động kỳ này vs kỳ trước
    renderGrowthBadge('growth-orders', d.growth?.orders, 'vs kỳ trước');
    renderGrowthBadge('growth-avg', d.growth?.avg_value, 'tăng trưởng');
  }
};

const loadChart = async (days) => {
  const res = await api.get(`/api/dashboard/revenue-chart?days=${days}`).catch(() => null);
  if (!res?.success) return;

  const data = res.data;
  const canvas = document.getElementById('revenue-chart');
  if (!canvas || typeof Chart === 'undefined') return;

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(canvas, {
    type: 'line',
    data: {
      labels: data.map(d => {
        if (!d.date) return '';
        const parts = d.date.split('-');
        if (parts.length === 3) {
          return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return d.date;
      }),
      datasets: [{
        label: 'Doanh thu (VNĐ)',
        data: data.map(d => d.total_revenue),
        borderColor: '#f07800',
        backgroundColor: 'rgba(240,120,0,0.08)',
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: '#f07800',
        fill: true,
        tension: 0.4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${fmtCurrency(ctx.raw)}`,
          }
        }
      },
      scales: {
        x: {
          ticks: { color: 'var(--ink-mute)', font: { size: 11 }, maxRotation: 45 },
          grid: { color: 'rgba(15, 23, 42, 0.05)' },
        },
        y: {
          ticks: {
            color: 'var(--ink-mute)',
            font: { size: 11 },
            callback: (v) => new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(v),
          },
          grid: { color: 'rgba(15, 23, 42, 0.05)' },
        }
      }
    }
  });
};

const loadTopProducts = async () => {
  const res = await api.get('/api/dashboard/top-products?limit=5').catch(() => null);
  const el = document.getElementById('top-products');
  if (!el) return;

  if (!res?.success || !res.data.length) {
    el.innerHTML = `<div class="empty-state"><div class="icon">${IcoTrophy}</div><p>Chưa có dữ liệu</p></div>`;
    return;
  }

  el.innerHTML = res.data.map((p, i) => {
    const rankClass = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : 'rank-other';
    return `
      <div class="top-product-row">
        <div class="top-product-rank ${rankClass}">${i + 1}</div>
        <div class="top-product-name">${p.name}</div>
        <div class="top-product-qty">×${fmt(p.total_quantity)}</div>
        <div class="top-product-revenue">${fmtCurrency(p.total_revenue)}</div>
      </div>
    `;
  }).join('');
};

let recentOrdersData = [];
let recentOrdersCurrentPage = 1;
const recentOrdersItemsPerPage = 10;

window.changeDashboardPage = (page) => {
  recentOrdersCurrentPage = page;
  renderRecentOrdersTableBody();
};

const renderRecentOrdersTableBody = () => {
  const tbody = document.getElementById('recent-orders-tbody');
  const pagContainer = document.getElementById('dashboard-pagination-container');
  if (!tbody) return;

  const startIndex = (recentOrdersCurrentPage - 1) * recentOrdersItemsPerPage;
  const sliced = recentOrdersData.slice(startIndex, startIndex + recentOrdersItemsPerPage);

  tbody.innerHTML = sliced.map(o => `
    <tr>
      <td><strong>${o.order_code || ('#' + String(o.id).padStart(6, '0'))}</strong></td>
      <td>${o.customer_name || '<span class="text-muted">Khách lẻ</span>'}</td>
      <td>${o.cashier_name}</td>
      <td class="currency">${fmtCurrency(o.total)}</td>
      <td>${statusBadge(o.payment_status)}</td>
      <td class="text-muted">${fmtDate(o.created_at)}</td>
    </tr>
  `).join('');

  if (pagContainer) {
    pagContainer.innerHTML = Pagination.render(recentOrdersData.length, recentOrdersCurrentPage, recentOrdersItemsPerPage, 'changeDashboardPage');
  }
};

const loadRecentOrders = async () => {
  const res = await api.get('/api/dashboard/recent-orders').catch(() => null);
  const tbody = document.getElementById('recent-orders-tbody');
  if (!tbody) return;

  if (!res?.success || !res.data.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted" style="padding:24px">Chưa có đơn hàng nào</td></tr>';
    document.getElementById('dashboard-pagination-container').innerHTML = '';
    return;
  }

  recentOrdersData = res.data;
  recentOrdersCurrentPage = 1;
  renderRecentOrdersTableBody();
};

export const init = async () => {
  let currentPeriod = 7;

  await Promise.all([
    loadStats(),
    loadPeriodStats(currentPeriod),
    loadChart(currentPeriod),
    loadTopProducts(),
    loadRecentOrders(),
  ]);

  // Period toggle
  document.querySelectorAll('.period-pill').forEach(btn => {
    btn.addEventListener('click', async () => {
      document.querySelectorAll('.period-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentPeriod = parseInt(btn.dataset.period);
      await Promise.all([loadPeriodStats(currentPeriod), loadChart(currentPeriod)]);
    });
  });

  // Gán sự kiện click vào Stat Cards để chuyển hướng chuyển tab tương ứng
  document.getElementById('card-revenue')?.addEventListener('click', () => {
    window.location.hash = '#reports';
  });
  document.getElementById('card-period-orders')?.addEventListener('click', () => {
    window.location.hash = '#invoices';
  });
  document.getElementById('card-avg')?.addEventListener('click', () => {
    window.location.hash = '#invoices';
  });
  document.getElementById('card-new-customers')?.addEventListener('click', () => {
    window.location.hash = '#customers';
  });
};
