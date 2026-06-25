/**
 * reports.js — View báo cáo thống kê chuyên sâu
 */
import { api } from '../api.js';
import { Toast } from '../components/toast.js';
import { Pagination } from '../components/pagination.js';

let activeTab = 'revenue';
let chartInstance = null;

let logsData = [];
let logsCurrentPage = 1;
const logsItemsPerPage = 10;

const fmtCurrency = (n) => new Intl.NumberFormat('vi-VN').format(n || 0) + ' VNĐ';

// Định dạng ngày tháng an toàn trên tất cả trình duyệt (chuyển khoảng trắng thành T)
const fmtDate = (d) => {
  if (!d) return '';
  const cleanDateStr = String(d).replace(' ', 'T');
  const date = new Date(cleanDateStr);
  if (isNaN(date.getTime())) return d; // Fallback trả về nguyên bản
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

window.changeLogsPage = (page) => {
  logsCurrentPage = page;
  renderLogsTable();
};

// SVG Icons
const IcoChart = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 6px; color: var(--primary);"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`;
const IcoDownload = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;
const IcoFile = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;

let revenueData = [];
let revenueCurrentPage = 1;
const revenueItemsPerPage = 10;

window.changeRevenuePage = (page) => {
  revenueCurrentPage = page;
  renderRevenueTableBody();
};

// Dịch các action từ DB sang tiếng Việt
const translateAction = (action) => {
  const map = {
    'LOGIN': 'Đăng nhập',
    'LOGOUT': 'Đăng xuất',
    'CREATE_ORDER': 'Tạo đơn hàng',
    'CANCEL_ORDER': 'Hủy đơn hàng',
    'DELETE_ORDER': 'Xóa đơn nháp',
    'PAY_CASH': 'Thanh toán tiền mặt',
    'PAY_QR': 'Yêu cầu thanh toán QR',
    'CREATE_USER': 'Tạo tài khoản',
    'UPDATE_USER': 'Cập nhật tài khoản',
    'DELETE_USER': 'Xóa tài khoản',
    'TOGGLE_USER_STATUS': 'Khóa/Kích hoạt tài khoản',
    'CREATE_PRODUCT': 'Tạo sản phẩm',
    'UPDATE_PRODUCT': 'Cập nhật sản phẩm',
    'DELETE_PRODUCT': 'Xóa sản phẩm',
    'CREATE_CATEGORY': 'Tạo danh mục',
    'UPDATE_CATEGORY': 'Cập nhật danh mục',
    'DELETE_CATEGORY': 'Xóa danh mục',
    'CREATE_TABLE': 'Tạo bàn ăn',
    'UPDATE_TABLE': 'Cập nhật bàn ăn',
    'DELETE_TABLE': 'Xóa bàn ăn',
    'CREATE_VOUCHER': 'Tạo khuyến mãi',
    'UPDATE_VOUCHER': 'Cập nhật khuyến mãi',
    'DELETE_VOUCHER': 'Xóa khuyến mãi',
    'START_SHIFT': 'Bắt đầu ca làm',
    'END_SHIFT': 'Kết thúc ca làm',
    'CHECK_IN': 'Chấm công vào',
    'CHECK_OUT': 'Chấm công ra',
    'CLEANED_TABLE': 'Giải phóng bàn'
  };
  return map[action] || action;
};

export const render = () => `
  <div class="page">
    <!-- Tabs & Export Actions -->
    <div class="filter-bar" style="border-bottom: 2px solid var(--hairline); padding-bottom: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
      <div style="display: flex; gap: 4px; flex-wrap: wrap;">
        <button class="btn btn-ghost filter-tab-btn active" data-tab="revenue">Doanh thu</button>
        <button class="btn btn-ghost filter-tab-btn" data-tab="products">Sản phẩm</button>
        <button class="btn btn-ghost filter-tab-btn" data-tab="staff">Nhân viên</button>
        <button class="btn btn-ghost filter-tab-btn" data-tab="customers">Khách hàng</button>
        <button class="btn btn-ghost filter-tab-btn" data-tab="vouchers">Khuyến mãi</button>
        <button class="btn btn-ghost filter-tab-btn" data-tab="logs">Nhật ký</button>
      </div>
      <div style="display: flex; gap: 8px;">
        <button id="btn-export-excel" class="btn btn-outline btn-sm" style="display: inline-flex; align-items: center; height: 34px; cursor:pointer;">
          ${IcoDownload} Excel
        </button>
        <button id="btn-export-pdf" class="btn btn-outline btn-sm" style="display: inline-flex; align-items: center; height: 34px; cursor:pointer;">
          ${IcoFile} PDF
        </button>
      </div>
    </div>

    <!-- Comparison Stats Row (only shown on Revenue tab) -->
    <div id="revenue-comparison-grid" style="display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:20px;">
      <!-- Rendered dynamically -->
    </div>

    <!-- Chart Container (only shown on relevant tabs) -->
    <div class="card" id="report-chart-card" style="margin-bottom: 24px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px;">
        <h3 id="chart-title" style="margin:0;">Biểu đồ</h3>
        <div id="chart-filter-container" style="display:none;">
          <select class="form-control" id="revenue-chart-range" style="width:140px; height:34px; font-size:13px; border-radius:8px; padding: 4px 10px; cursor:pointer; font-weight:600; border: 1px solid var(--hairline); background: var(--canvas);">
            <option value="7">7 ngày qua</option>
            <option value="30" selected>30 ngày qua</option>
            <option value="365">12 tháng qua</option>
          </select>
        </div>
      </div>
      <div style="position: relative; height: 320px; width: 100%;">
        <canvas id="report-canvas"></canvas>
      </div>
    </div>

    <!-- Data Table -->
    <h3 style="margin-bottom: 12px;" id="table-title">Chi tiết số liệu</h3>
    <div class="table-wrapper">
      <table id="report-table">
        <thead id="report-table-head">
          <!-- Rendered dynamically -->
        </thead>
        <tbody id="report-table-body">
          <!-- Rendered dynamically -->
        </tbody>
      </table>
    </div>
    <div id="reports-pagination-container"></div>
  </div>
`;

export const init = async () => {
  // Bind tab click events
  document.querySelectorAll('.filter-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTab = btn.dataset.tab;
      loadTabReport(activeTab);
    });
  });

  // Gán sự kiện cho bộ lọc biểu đồ Doanh thu
  document.getElementById('revenue-chart-range')?.addEventListener('change', (e) => {
    updateRevenueChart(e.target.value);
  });

  // Gán sự kiện cho các nút xuất Excel & PDF động theo Tab hiện tại
  document.getElementById('btn-export-excel')?.addEventListener('click', () => {
    const token = localStorage.getItem('cafe_token');
    window.open(`/api/reports/export/excel?tab=${activeTab}&token=${token}`, '_blank');
  });

  document.getElementById('btn-export-pdf')?.addEventListener('click', () => {
    const token = localStorage.getItem('cafe_token');
    window.open(`/api/reports/export/pdf?tab=${activeTab}&token=${token}`, '_blank');
  });

  // Load default tab
  loadTabReport(activeTab);
};

const loadTabReport = async (tab) => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  const chartCard = document.getElementById('report-chart-card');
  const chartFilter = document.getElementById('chart-filter-container');
  const tableBody = document.getElementById('report-table-body');
  const tableHead = document.getElementById('report-table-head');
  const pagContainer = document.getElementById('reports-pagination-container');
  const compGrid = document.getElementById('revenue-comparison-grid');

  if (!tableBody || !tableHead) return;
  if (pagContainer) pagContainer.innerHTML = '';
  if (compGrid) compGrid.innerHTML = '';

  tableBody.innerHTML = `<tr><td colspan="10" class="text-center">Đang tải số liệu...</td></tr>`;

  if (chartFilter) chartFilter.style.display = 'none';

  try {
    if (tab === 'revenue') {
      chartCard.style.display = 'block';
      if (compGrid) compGrid.style.display = 'grid';
      const res = await api.get('/api/reports/revenue');
      if (res.success) {
        renderRevenueReport(res);
      }
    } else {
      if (compGrid) compGrid.style.display = 'none';
      if (tab === 'products') {
        chartCard.style.display = 'block';
        const res = await api.get('/api/reports/products');
        if (res.success) {
          renderProductsReport(res.data);
        }
      } else if (tab === 'staff') {
        chartCard.style.display = 'block';
        const res = await api.get('/api/reports/staff');
        if (res.success) {
          renderStaffReport(res.data);
        }
      } else if (tab === 'customers') {
        chartCard.style.display = 'none';
        const res = await api.get('/api/reports/customers');
        if (res.success) {
          renderCustomersReport(res.data);
        }
      } else if (tab === 'vouchers') {
        chartCard.style.display = 'none';
        const res = await api.get('/api/reports/vouchers');
        if (res.success) {
          renderVouchersReport(res.data);
        }
      } else if (tab === 'logs') {
        chartCard.style.display = 'none';
        const res = await api.get('/api/reports/activity-logs');
        if (res.success) {
          renderLogsReport(res.data);
        }
      }
    }
  } catch (err) {
    Toast.error('Không thể tải dữ liệu báo cáo.');
    tableBody.innerHTML = `<tr><td colspan="10" class="text-center text-danger">Lỗi tải dữ liệu.</td></tr>`;
  }
};

const renderRevenueTableBody = () => {
  const tableBody = document.getElementById('report-table-body');
  const pagContainer = document.getElementById('reports-pagination-container');
  if (!tableBody) return;

  const startIndex = (revenueCurrentPage - 1) * revenueItemsPerPage;
  const sliced = revenueData.slice(startIndex, startIndex + revenueItemsPerPage);

  tableBody.innerHTML = sliced.map(row => `
    <tr>
      <td><strong>${(() => {
        if (!row.date) return '';
        const parts = row.date.split('-');
        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
        return row.date;
      })()}</strong></td>
      <td>${row.total_orders} đơn</td>
      <td>${fmtCurrency(row.total_subtotal)}</td>
      <td>-${fmtCurrency(row.total_discount_loyalty)}</td>
      <td>-${fmtCurrency(row.total_discount_voucher)}</td>
      <td style="color:var(--error); font-weight:600;">-${fmtCurrency(row.total_discount)}</td>
      <td style="color:var(--success); font-weight:700;">${fmtCurrency(row.net_revenue)}</td>
    </tr>
  `).join('');

  if (pagContainer) {
    pagContainer.innerHTML = Pagination.render(revenueData.length, revenueCurrentPage, revenueItemsPerPage, 'changeRevenuePage');
  }
};

const updateRevenueChart = (range) => {
  if (chartInstance) {
    chartInstance.destroy();
  }

  let labels = [];
  let netRevenue = [];

  if (range === '7' || range === '30') {
    const limit = parseInt(range);
    const dates = [];
    const netRevenueMap = {};

    revenueData.forEach(row => {
      if (row.date) {
        netRevenueMap[row.date] = row.net_revenue;
      }
    });

    for (let i = limit - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      dates.push(dateStr);
    }

    labels = dates.map(dateStr => {
      const parts = dateStr.split('-');
      return `${parts[2]}/${parts[1]}`;
    });
    netRevenue = dates.map(dateStr => netRevenueMap[dateStr] || 0);

  } else if (range === '365') {
    const months = [];
    const monthlyMap = {};

    revenueData.forEach(row => {
      if (!row.date) return;
      const m = row.date.substring(0, 7);
      monthlyMap[m] = (monthlyMap[m] || 0) + row.net_revenue;
    });

    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const monthStr = `${year}-${month}`;
      
      months.push(monthStr);
    }

    labels = months.map(mStr => {
      const parts = mStr.split('-');
      return `${parts[1]}/${parts[0]}`;
    });
    netRevenue = months.map(mStr => monthlyMap[mStr] || 0);
  }

  const ctx = document.getElementById('report-canvas').getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Doanh thu thuần (VNĐ)',
        data: netRevenue,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.05)',
        borderWidth: 2.5,
        pointRadius: 4,
        pointBackgroundColor: '#2563eb',
        tension: 0.15,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` Doanh thu: ${new Intl.NumberFormat('vi-VN').format(ctx.raw)} VNĐ`,
          }
        }
      },
      scales: {
        x: {
          ticks: { color: 'var(--ink-mute)', font: { size: 11 } },
          grid: { color: 'rgba(15, 23, 42, 0.04)' }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: 'var(--ink-mute)',
            font: { size: 11 },
            callback: (v) => new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(v) + ' đ'
          },
          grid: { color: 'rgba(15, 23, 42, 0.04)' }
        }
      }
    }
  });
};

const renderRevenueReport = (res) => {
  const tableHead = document.getElementById('report-table-head');
  const compGrid = document.getElementById('revenue-comparison-grid');
  const chartFilter = document.getElementById('chart-filter-container');
  
  document.getElementById('chart-title').textContent = 'Biểu đồ Doanh thu';
  document.getElementById('table-title').textContent = 'Bảng số liệu Doanh thu';

  const data = res.data;
  const comp = res.comparison;

  if (chartFilter) {
    chartFilter.style.display = 'block';
  }

  if (compGrid && comp) {
    const calcGrowth = (curr, prev) => {
      if (!prev) return curr > 0 ? '+100%' : '0%';
      const g = ((curr - prev) / prev) * 100;
      return (g >= 0 ? '+' : '') + g.toFixed(1) + '%';
    };

    compGrid.innerHTML = `
      <div class="stat-mini-card">
        <div class="stat-label">Hôm nay</div>
        <div class="stat-value" style="color:var(--primary); font-size:18px;">${fmtCurrency(comp.today)}</div>
        <div style="font-size:11px; margin-top:4px; font-weight:600; color:${comp.today >= comp.yesterday ? 'var(--success)' : 'var(--error)'}">
          ${calcGrowth(comp.today, comp.yesterday)} vs Hôm qua
        </div>
      </div>
      <div class="stat-mini-card">
        <div class="stat-label">Hôm qua</div>
        <div class="stat-value" style="font-size:18px;">${fmtCurrency(comp.yesterday)}</div>
      </div>
      <div class="stat-mini-card">
        <div class="stat-label">Tuần này</div>
        <div class="stat-value" style="color:var(--success); font-size:18px;">${fmtCurrency(comp.this_week)}</div>
        <div style="font-size:11px; margin-top:4px; font-weight:600; color:${comp.this_week >= comp.last_week ? 'var(--success)' : 'var(--error)'}">
          ${calcGrowth(comp.this_week, comp.last_week)} vs Tuần trước
        </div>
      </div>
      <div class="stat-mini-card">
        <div class="stat-label">Tháng này</div>
        <div class="stat-value" style="color:var(--primary); font-size:18px;">${fmtCurrency(comp.this_month)}</div>
        <div style="font-size:11px; margin-top:4px; font-weight:600; color:${comp.this_month >= comp.last_month ? 'var(--success)' : 'var(--error)'}">
          ${calcGrowth(comp.this_month, comp.last_month)} vs Tháng trước
        </div>
      </div>
    `;
  }

  tableHead.innerHTML = `
    <tr>
      <th>Ngày</th>
      <th>Số đơn</th>
      <th>Doanh thu tạm tính</th>
      <th>Loyalty giảm</th>
      <th>Voucher giảm</th>
      <th>Tổng giảm giá</th>
      <th>Doanh thu thuần</th>
    </tr>
  `;

  if (data.length === 0) {
    document.getElementById('report-table-body').innerHTML = `<tr><td colspan="7" class="text-center text-muted">Không có dữ liệu.</td></tr>`;
    return;
  }

  revenueData = data;
  revenueCurrentPage = 1;
  renderRevenueTableBody();

  const rangeSelect = document.getElementById('revenue-chart-range');
  const defaultRange = rangeSelect ? rangeSelect.value : '30';
  updateRevenueChart(defaultRange);
};

const renderProductsReport = (data) => {
  const tableHead = document.getElementById('report-table-head');
  const tableBody = document.getElementById('report-table-body');
  document.getElementById('chart-title').textContent = 'Top Sản phẩm bán chạy (Bar)';
  document.getElementById('table-title').textContent = 'Bảng thống kê Sản phẩm';

  tableHead.innerHTML = `
    <tr>
      <th>Tên sản phẩm</th>
      <th>Số lượng đã bán</th>
      <th>Tổng doanh số bán lẻ</th>
    </tr>
  `;

  if (data.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="3" class="text-center text-muted">Không có dữ liệu.</td></tr>`;
    return;
  }

  tableBody.innerHTML = data.map(row => `
    <tr>
      <td><strong>${row.name}</strong></td>
      <td>${row.total_quantity} cốc/phần</td>
      <td style="color:var(--primary); font-weight:700;">${fmtCurrency(row.total_revenue)}</td>
    </tr>
  `).join('');

  const labels = data.slice(0, 7).map(row => row.name);
  const quantities = data.slice(0, 7).map(row => row.total_quantity);

  const ctx = document.getElementById('report-canvas').getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Số lượng bán ra',
        data: quantities,
        backgroundColor: '#4A154B',
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
};

const renderStaffReport = (data) => {
  const tableHead = document.getElementById('report-table-head');
  const tableBody = document.getElementById('report-table-body');
  document.getElementById('chart-title').textContent = 'Doanh số Nhân viên (Bar)';
  document.getElementById('table-title').textContent = 'Bảng thống kê Nhân sự';

  tableHead.innerHTML = `
    <tr>
      <th>Họ tên</th>
      <th>Số ca làm</th>
      <th>Tổng giờ làm</th>
      <th>Tổng lương (VND)</th>
      <th>Tổng doanh số đã bán</th>
    </tr>
  `;

  if (data.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Không có dữ liệu.</td></tr>`;
    return;
  }

  tableBody.innerHTML = data.map(row => `
    <tr>
      <td><strong>${row.full_name}</strong></td>
      <td>${row.total_shifts} ca</td>
      <td>${parseFloat(row.total_hours).toFixed(1)} giờ</td>
      <td>${fmtCurrency(row.total_salary)}</td>
      <td style="color:var(--success); font-weight:700;">${fmtCurrency(row.total_sales)}</td>
    </tr>
  `).join('');

  const labels = data.map(row => row.full_name);
  const sales = data.map(row => row.total_sales);

  const ctx = document.getElementById('report-canvas').getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Doanh số bán lẻ (VND)',
        data: sales,
        backgroundColor: '#007A5A',
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
};

const renderCustomersReport = (data) => {
  const tableHead = document.getElementById('report-table-head');
  const tableBody = document.getElementById('report-table-body');
  document.getElementById('table-title').textContent = 'Bảng thống kê Khách hàng thân thiết';

  tableHead.innerHTML = `
    <tr>
      <th>Họ tên</th>
      <th>Số điện thoại</th>
      <th>Số đơn hàng</th>
      <th>Tổng chi tiêu</th>
    </tr>
  `;

  if (data.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Không có dữ liệu.</td></tr>`;
    return;
  }

  tableBody.innerHTML = data.map(row => `
    <tr>
      <td><strong>${row.full_name}</strong></td>
      <td>${row.phone}</td>
      <td>${row.total_orders} đơn</td>
      <td style="color:var(--primary); font-weight:700;">${fmtCurrency(row.total_spent)}</td>
    </tr>
  `).join('');
};

const renderVouchersReport = (data) => {
  const tableHead = document.getElementById('report-table-head');
  const tableBody = document.getElementById('report-table-body');
  document.getElementById('table-title').textContent = 'Bảng thống kê Khuyến mãi';

  tableHead.innerHTML = `
    <tr>
      <th>Mã Voucher</th>
      <th>Loại</th>
      <th>Giá trị</th>
      <th>Lượt dùng</th>
      <th>Giới hạn dùng</th>
      <th>Tổng số tiền đã giảm</th>
    </tr>
  `;

  if (data.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Không có dữ liệu.</td></tr>`;
    return;
  }

  tableBody.innerHTML = data.map(row => `
    <tr>
      <td><strong>${row.code}</strong></td>
      <td>${row.type === 'percent' ? 'Phần trăm (%)' : 'Cố định (VND)'}</td>
      <td>${row.type === 'percent' ? `${row.value}%` : fmtCurrency(row.value)}</td>
      <td>${row.used_count} lượt</td>
      <td>${row.usage_limit || 'Không giới hạn'}</td>
      <td style="color:var(--error); font-weight:700;">-${fmtCurrency(row.total_discount)}</td>
    </tr>
  `).join('');
};

const renderLogsReport = (data) => {
  const tableHead = document.getElementById('report-table-head');
  const tableBody = document.getElementById('report-table-body');
  document.getElementById('table-title').textContent = 'Nhật ký hoạt động hệ thống';

  tableHead.innerHTML = `
    <tr>
      <th style="width: 15%">Thời gian</th>
      <th style="width: 15%">Tài khoản</th>
      <th style="width: 20%">Hành động</th>
      <th style="width: 50%">Chi tiết</th>
    </tr>
  `;

  if (data.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Không có nhật ký nào.</td></tr>`;
    return;
  }

  logsData = data;
  logsCurrentPage = 1;
  renderLogsTable();
};

const renderLogsTable = () => {
  const tableBody = document.getElementById('report-table-body');
  const pagContainer = document.getElementById('reports-pagination-container');
  if (!tableBody) return;

  const startIndex = (logsCurrentPage - 1) * logsItemsPerPage;
  const sliced = logsData.slice(startIndex, startIndex + logsItemsPerPage);

  tableBody.innerHTML = sliced.map(row => `
    <tr>
      <td class="text-muted" style="font-size:0.82rem">${fmtDate(row.created_at)}</td>
      <td><strong>@${row.username}</strong><br/><small class="text-muted">${row.full_name}</small></td>
      <td><span class="badge badge-info">${translateAction(row.action)}</span></td>
      <td class="text-muted" style="font-size:0.875rem">${row.description}</td>
    </tr>
  `).join('');

  if (pagContainer) {
    pagContainer.innerHTML = Pagination.render(logsData.length, logsCurrentPage, logsItemsPerPage, 'changeLogsPage');
  }
};
