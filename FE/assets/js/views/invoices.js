/**
 * invoices.js — View Hóa đơn
 */
import { api } from '../api.js';
import { Toast } from '../components/toast.js';
import { Modal } from '../components/modal.js';
import { Pagination } from '../components/pagination.js';

// SVG Icons
const IcoSearch  = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
const IcoEye     = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
const IcoPrint   = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>`;
const IcoX       = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
const IcoReceipt = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`;
const IcoCash    = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`;
const IcoQR      = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/></svg>`;
const IcoDownload = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;

const fmtCurrency = (n) => new Intl.NumberFormat('vi-VN').format(n || 0) + ' VNĐ';
const fmtDate = (d) => {
  if (!d) return '';
  const date = new Date(d);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const getUser = () => { try { return JSON.parse(localStorage.getItem('cafe_user')); } catch { return null; } };

let invoices = [];
let filters = { dateFrom: '', dateTo: '', status: '', search: '' };
let currentPage = 1;
const itemsPerPage = 10;

window.changeInvoicePage = (page) => {
  currentPage = page;
  renderTable();
};

const statusBadge = (status) => {
  const map = {
    paid:      '<span class="badge badge-success">✓ Đã thanh toán</span>',
    pending:   '<span class="badge badge-warning">Chờ thanh toán</span>',
    cancelled: '<span class="badge badge-danger">✗ Đã hủy</span>',
  };
  return map[status] || status;
};

const payMethodLabel = (m) => m === 'cash'
  ? `<span style="display:inline-flex;align-items:center;gap:4px">${IcoCash} Tiền mặt</span>`
  : `<span style="display:inline-flex;align-items:center;gap:4px">${IcoQR} Chuyển khoản</span>`;

const parseInputDate = (str) => {
  if (!str) return '';
  const parts = str.split('/');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    if (day && month && year && year.length === 4) {
      return `${year}-${month}-${day}`;
    }
  }
  return str; // Fallback
};

export const render = () => `
<div class="page">
  <!-- Filter Bar -->
  <div class="filter-bar" style="margin-bottom:8px; display:flex; gap:8px; flex-wrap:wrap; align-items:flex-end;">
    <div class="search-input-wrap" style="flex:1; min-width:180px;">
      <span class="icon">${IcoSearch}</span>
      <input class="form-control" type="text" id="inv-search" placeholder="Tìm mã đơn..." />
    </div>

    <!-- Date range group -->
    <div style="display:flex; align-items:flex-end; gap:6px; background:var(--canvas-cream); border:1px solid var(--hairline); border-radius:var(--radius-md); padding:6px 10px;">
      <div style="display:flex; flex-direction:column; gap:3px;">
        <label style="font-size:10px; font-weight:700; color:var(--ink-mute); text-transform:uppercase; white-space:nowrap;">Từ ngày</label>
        <input class="form-control" type="text" id="inv-date-from" placeholder="dd/mm/yyyy" style="width:140px; height:32px; font-size:12px;" />
      </div>
      <span style="color:var(--ink-mute); font-size:14px; padding-bottom:4px;">→</span>
      <div style="display:flex; flex-direction:column; gap:3px;">
        <label style="font-size:10px; font-weight:700; color:var(--ink-mute); text-transform:uppercase; white-space:nowrap;">Đến ngày</label>
        <input class="form-control" type="text" id="inv-date-to" placeholder="dd/mm/yyyy" style="width:140px; height:32px; font-size:12px;" />
      </div>
    </div>

    <div style="display:flex; flex-direction:column; gap:3px;">
      <label style="font-size:10px; font-weight:700; color:var(--ink-mute); text-transform:uppercase;">Trạng thái</label>
      <select class="form-control" id="inv-status" style="width:160px; height:32px; font-size:12px;">
        <option value="">Tất cả trạng thái</option>
        <option value="paid">Đã thanh toán</option>
        <option value="pending">Chờ thanh toán</option>
        <option value="cancelled">Đã hủy</option>
      </select>
    </div>

    <div style="display:flex; gap:6px; align-self:flex-end;">
      <button class="btn btn-primary btn-sm" id="inv-search-btn" style="height:32px; display:inline-flex; align-items:center; gap:6px;">
        ${IcoSearch} Lọc
      </button>
      <button class="btn btn-outline btn-sm" id="export-invoice-excel-btn" style="height:32px; display:inline-flex; align-items:center; gap:6px; cursor:pointer;">
        ${IcoDownload} Xuất Excel
      </button>
    </div>
  </div>

  <div class="table-wrapper">
    <table style="width: 100%; border-collapse: collapse; white-space: nowrap;">
      <thead>
        <tr>
          <th>Mã HĐ</th>
          <th>Khách hàng</th>
          <th>Thu ngân</th>
          <th>Tổng tiền</th>
          <th>Thanh toán</th>
          <th>Trạng thái</th>
          <th>Thời gian</th>
          <th style="text-align:center">Thao tác</th>
        </tr>
      </thead>
      <tbody id="invoices-tbody">
        <tr><td colspan="8" class="text-center text-muted" style="padding:24px">Đang tải...</td></tr>
      </tbody>
    </table>
  </div>
  <div id="invoice-pagination-container"></div>
</div>
`;

const renderTable = () => {
  const tbody = document.getElementById('invoices-tbody');
  if (!tbody) return;
  const user = getUser();

  if (!invoices.length) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><div class="icon">${IcoReceipt}</div><p>Không có hóa đơn nào</p></div></td></tr>`;
    document.getElementById('invoice-pagination-container').innerHTML = '';
    return;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const sliced = invoices.slice(startIndex, startIndex + itemsPerPage);

  tbody.innerHTML = sliced.map(inv => `
    <tr class="clickable" data-id="${inv.id}">
      <td><strong>${inv.order_code || ('#' + String(inv.id).padStart(6,'0'))}</strong></td>
      <td>${inv.customer_name ? `${inv.customer_name}<br/><small class="text-muted">${inv.customer_phone}</small>` : '<span class="text-muted">Khách lẻ</span>'}</td>
      <td>${inv.cashier_name}</td>
      <td class="currency">${fmtCurrency(inv.total)}</td>
      <td>${payMethodLabel(inv.payment_method)}</td>
      <td>${statusBadge(inv.payment_status)}</td>
      <td class="text-muted" style="font-size:0.82rem">${fmtDate(inv.created_at)}</td>
      <td style="text-align:center">
        <div style="display:flex;gap:6px;justify-content:center;flex-wrap:nowrap">
          <button class="btn btn-secondary btn-sm view-invoice-btn" data-id="${inv.id}" title="Chi tiết">
            ${IcoEye} Chi tiết
          </button>
          <button class="btn btn-ghost btn-sm print-invoice-btn" data-id="${inv.id}" title="In">
            ${IcoPrint}
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  const pagContainer = document.getElementById('invoice-pagination-container');
  if (pagContainer) {
    pagContainer.innerHTML = Pagination.render(invoices.length, currentPage, itemsPerPage, 'changeInvoicePage');
  }

  tbody.querySelectorAll('.view-invoice-btn').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); openDetail(btn.dataset.id); });
  });

  tbody.querySelectorAll('.print-invoice-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const token = localStorage.getItem('cafe_token');
      window.open(`/api/invoices/${btn.dataset.id}/print?token=${token}`, '_blank');
    });
  });

  tbody.querySelectorAll('tr.clickable').forEach(row => {
    row.addEventListener('click', () => openDetail(row.dataset.id));
  });
};

const openDetail = async (id) => {
  const res = await api.get(`/api/orders/${id}`).catch(e => { Toast.error(e.message); return null; });
  if (!res?.success) { Toast.error('Không thể tải chi tiết hóa đơn.'); return; }
  const o = res.data;
  const items = o.items || [];
  const user = getUser();

  Modal.open({
    title: `Hóa đơn ${o.order_code || ('#' + String(o.id).padStart(6,'0'))}`,
    size: 'lg',
    hideFooter: false,
    cancelText: 'Đóng',
    content: `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;font-size:0.875rem">
        <div>
          <div class="text-muted">Khách hàng</div>
          <div style="font-weight:600">${o.customer_name || 'Khách lẻ'}${o.customer_phone ? ` (${o.customer_phone})` : ''}</div>
        </div>
        <div>
          <div class="text-muted">Thu ngân</div>
          <div style="font-weight:600">${o.cashier_name}</div>
        </div>
        <div>
          <div class="text-muted">Thời gian</div>
          <div>${fmtDate(o.created_at)}</div>
        </div>
        <div>
          <div class="text-muted">Trạng thái</div>
          <div>${statusBadge(o.payment_status)}</div>
        </div>
      </div>

      <div class="table-wrapper" style="margin-bottom:16px">
        <table>
          <thead><tr><th>Sản phẩm</th><th style="text-align:center">SL</th><th style="text-align:right">Đơn giá</th><th style="text-align:right">Thành tiền</th></tr></thead>
          <tbody>
            ${items.map(i => `
              <tr>
                <td>${i.product_name_snapshot}</td>
                <td style="text-align:center">${i.quantity}</td>
                <td style="text-align:right">${fmtCurrency(i.unit_price_snapshot)}</td>
                <td style="text-align:right" class="currency">${fmtCurrency(i.subtotal)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div style="border-top:1px solid var(--hairline);padding-top:12px;font-size:0.9rem">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
          <span class="text-muted">Tạm tính</span><span>${fmtCurrency(o.subtotal)}</span>
        </div>
        ${o.discount_loyalty > 0 ? `
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;color:var(--success)">
            <span>Giảm Loyalty (10%)</span><span>−${fmtCurrency(o.discount_loyalty)}</span>
          </div>` : ''}
        ${o.discount_voucher > 0 ? `
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;color:var(--success)">
            <span>Giảm Voucher</span><span>−${fmtCurrency(o.discount_voucher)}</span>
          </div>` : ''}
        <div style="display:flex;justify-content:space-between;font-weight:800;font-size:1.1rem;border-top:1px solid var(--hairline);padding-top:8px;margin-top:8px">
          <span>TỔNG CỘNG</span><span class="currency">${fmtCurrency(o.total)}</span>
        </div>
        <div style="margin-top:8px;color:var(--ink-mute);font-size:0.82rem">
          Nơi dùng: ${o.table_name ? `Bàn: ${o.table_name}` : 'Mang đi (Takeaway)'}<br/>
          PTTT: ${payMethodLabel(o.payment_method)}
          ${o.cancel_reason ? `<br/>Lý do hủy: ${o.cancel_reason}` : ''}
        </div>
      </div>

      <div style="margin-top:16px;display:flex;gap:8px;justify-content:space-between;align-items:center;">
        <button class="btn btn-ghost btn-sm" onclick="window.open('/api/invoices/${o.id}/print?token=' + localStorage.getItem('cafe_token'),'_blank')">
          ${IcoPrint} In hóa đơn
        </button>
        ${(o.payment_status === 'pending' || (user?.role === 'admin' && o.payment_status === 'paid')) ? `
          <button class="btn btn-danger btn-sm" id="detail-cancel-btn">
            ${IcoX} Hủy hóa đơn
          </button>
        ` : ''}
      </div>
    `,
  });

  setTimeout(() => {
    document.getElementById('detail-cancel-btn')?.addEventListener('click', () => {
      Modal.close();
      openCancel(o.id, o);
    });
  }, 100);
};

const openCancel = (id, order = null) => {
  const isPaid = order?.payment_status === 'paid';
  const refundText = isPaid ? `<div style="margin-bottom:12px; font-weight:700; color:var(--error);">Số tiền hoàn trả: ${fmtCurrency(order.total)}</div>` : '';

  Modal.open({
    title: isPaid ? 'Hủy hóa đơn & Hoàn tiền' : 'Hủy đơn hàng',
    content: `
      ${refundText}
      <p style="color:var(--ink-mute);margin-bottom:16px">Vui lòng nhập lý do hủy đơn:</p>
      <div class="form-group">
        <textarea class="form-control" id="cancel-reason-input" rows="3" placeholder="Lý do hủy đơn..." required></textarea>
      </div>
    `,
    confirmText: isPaid ? 'Xác nhận hủy & Hoàn tiền' : 'Hủy đơn hàng',
    onConfirm: async () => {
      const reason = document.getElementById('cancel-reason-input')?.value.trim();
      if (!reason) { Toast.warning('Vui lòng nhập lý do hủy.'); return; }

      const res = await api.patch(`/api/orders/${id}/cancel`, { cancel_reason: reason }).catch(e => { Toast.error(e.message); return null; });
      if (res?.success) {
        Toast.success(isPaid ? 'Đã hủy hóa đơn & hoàn trả doanh thu.' : 'Đã hủy đơn hàng.');
        Modal.close();
        await loadInvoices();
      } else {
        Toast.error(res?.message || 'Hủy đơn thất bại.');
      }
    },
  });
};

const loadInvoices = async () => {
  const params = new URLSearchParams();
  const dateFrom = parseInputDate(filters.dateFrom);
  const dateTo = parseInputDate(filters.dateTo);

  if (dateFrom) params.set('date_from', dateFrom);
  if (dateTo) params.set('date_to', dateTo);
  if (filters.status) params.set('status', filters.status);
  if (filters.search) params.set('search', filters.search);

  const res = await api.get(`/api/invoices?${params}`).catch(() => null);
  invoices = res?.data || [];
  currentPage = 1;
  renderTable();
};

export const init = async () => {
  document.getElementById('inv-search')?.addEventListener('input', (e) => { filters.search = e.target.value; });
  
  const setupDateMask = (inputEl, filterKey) => {
    if (!inputEl) return;
    inputEl.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '');
      if (v.length > 8) v = v.substring(0, 8);
      
      let formatted = '';
      if (v.length > 4) {
        formatted = `${v.substring(0, 2)}/${v.substring(2, 4)}/${v.substring(4)}`;
      } else if (v.length > 2) {
        formatted = `${v.substring(0, 2)}/${v.substring(2)}`;
      } else {
        formatted = v;
      }
      e.target.value = formatted;
      filters[filterKey] = formatted;
    });
  };

  setupDateMask(document.getElementById('inv-date-from'), 'dateFrom');
  setupDateMask(document.getElementById('inv-date-to'), 'dateTo');

  document.getElementById('inv-status')?.addEventListener('change', (e) => { filters.status = e.target.value; });
  document.getElementById('inv-search-btn')?.addEventListener('click', loadInvoices);
  document.getElementById('export-invoice-excel-btn')?.addEventListener('click', () => {
    const token = localStorage.getItem('cafe_token');
    const dateFrom = parseInputDate(filters.dateFrom);
    const dateTo = parseInputDate(filters.dateTo);

    const params = new URLSearchParams();
    params.set('tab', 'invoices');
    params.set('token', token);
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    if (filters.status) params.set('status', filters.status);
    if (filters.search) params.set('search', filters.search);

    window.open(`/api/reports/export/excel?${params.toString()}`, '_blank');
  });

  await loadInvoices();
};
