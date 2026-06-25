/**
 * customers.js — View Quản lý Khách hàng (Admin only)
 */
import { api } from '../api.js';
import { Toast } from '../components/toast.js';
import { Modal } from '../components/modal.js';
import { Pagination } from '../components/pagination.js';

// SVG Icons
const IcoSearch  = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
const IcoPlus    = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
const IcoEdit    = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
const IcoList    = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`;
const IcoUsers   = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
const IcoReceipt = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`;
const IcoDownload = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;

const fmtCurrency = (n) => new Intl.NumberFormat('vi-VN').format(n || 0) + ' VNĐ';
const fmtDate = (d) => {
  if (!d) return '';
  const date = new Date(d);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
};
const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n || 0);

let customers = [];
let searchQuery = '';
let currentPage = 1;
const itemsPerPage = 10;

let filterSpent = '';
let filterOrders = '';

window.changeCustomerPage = (page) => {
  currentPage = page;
  renderTable();
};

export const render = () => `
<div class="page">
  <div class="filter-bar" style="margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap;">
    <div style="display:flex; gap:8px; flex:1; max-width:640px; flex-wrap:wrap;">
      <div class="search-input-wrap" style="flex:1; min-width:180px;">
        <span class="icon">${IcoSearch}</span>
        <input class="form-control" type="text" id="cust-search" placeholder="Tìm theo SĐT hoặc tên..." />
      </div>
      <select class="form-control" id="cust-filter-spent" style="width:170px; height:36px;">
        <option value="">Tổng chi tiêu (Tất cả)</option>
        <option value="0-100k">Dưới 100k</option>
        <option value="100k-500k">100k - 500k</option>
        <option value="500k-2m">500k - 2 Triệu</option>
        <option value="2m-up">Trên 2 Triệu</option>
      </select>
      <select class="form-control" id="cust-filter-orders" style="width:160px; height:36px;">
        <option value="">Số đơn (Tất cả)</option>
        <option value="0">Chưa mua đơn nào</option>
        <option value="1-5">Từ 1 đến 5 đơn</option>
        <option value="5-15">Từ 5 đến 15 đơn</option>
        <option value="15-up">Trên 15 đơn</option>
      </select>
    </div>
    <div style="display:flex; gap:8px;">
      <button class="btn btn-outline btn-sm" id="export-customer-excel-btn" style="height:36px; display:inline-flex; align-items:center; gap:6px; cursor:pointer;">
        ${IcoDownload} Xuất Excel
      </button>
      <button class="btn btn-primary btn-sm" id="add-customer-btn" style="height:36px; display:inline-flex; align-items:center;">
        ${IcoPlus} Thêm khách hàng
      </button>
    </div>
  </div>

  <div class="table-wrapper">
    <table>
      <thead>
        <tr>
          <th>Họ và tên</th>
          <th>Số điện thoại</th>
          <th>Số đơn</th>
          <th>Tổng chi tiêu</th>
          <th>Ngày tạo</th>
          <th style="text-align:center">Hành động</th>
        </tr>
      </thead>
      <tbody id="customers-tbody">
        <tr><td colspan="6" class="text-center text-muted" style="padding:24px">Đang tải...</td></tr>
      </tbody>
    </table>
  </div>
  <div id="customer-pagination-container"></div>
</div>
`;

const renderTable = () => {
  const tbody = document.getElementById('customers-tbody');
  if (!tbody) return;

  const filtered = customers.filter(c => {
    const matchSearch = !searchQuery ||
      c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery);

    let matchSpent = true;
    if (filterSpent === '0-100k') matchSpent = c.total_spent < 100000;
    else if (filterSpent === '100k-500k') matchSpent = c.total_spent >= 100000 && c.total_spent <= 500000;
    else if (filterSpent === '500k-2m') matchSpent = c.total_spent >= 500000 && c.total_spent <= 2000000;
    else if (filterSpent === '2m-up') matchSpent = c.total_spent > 2000000;

    let matchOrders = true;
    if (filterOrders === '0') matchOrders = c.total_orders === 0;
    else if (filterOrders === '1-5') matchOrders = c.total_orders >= 1 && c.total_orders <= 5;
    else if (filterOrders === '5-15') matchOrders = c.total_orders >= 5 && c.total_orders <= 15;
    else if (filterOrders === '15-up') matchOrders = c.total_orders > 15;

    return matchSearch && matchSpent && matchOrders;
  });

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="icon">${IcoUsers}</div><p>Không tìm thấy khách hàng</p></div></td></tr>`;
    document.getElementById('customer-pagination-container').innerHTML = '';
    return;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const sliced = filtered.slice(startIndex, startIndex + itemsPerPage);

  tbody.innerHTML = sliced.map(c => `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:10px;">
          ${c.avatar_url ? `
            <img src="${c.avatar_url}" style="width:34px;height:34px;border-radius:50%;object-fit:cover;flex-shrink:0;" />
          ` : `
            <div style="
              width:34px;height:34px;border-radius:50%;
              background:var(--primary);
              display:flex;align-items:center;justify-content:center;
              font-weight:700;color:#fff;flex-shrink:0;font-size:14px
            ">${c.full_name.charAt(0).toUpperCase()}</div>
          `}
          <div style="font-weight:600">${c.full_name}</div>
        </div>
      </td>
      <td style="font-family:monospace">${c.phone}</td>
      <td><span class="badge badge-brand">${fmt(c.total_orders)} đơn</span></td>
      <td class="currency">${fmtCurrency(c.total_spent)}</td>
      <td class="text-muted">${fmtDate(c.created_at)}</td>
      <td style="text-align:center">
        <div style="display:flex;gap:6px;justify-content:center">
          <button class="btn btn-secondary btn-sm view-cust-btn" data-id="${c.id}" title="Lịch sử">
            ${IcoList} Lịch sử
          </button>
          <button class="btn btn-ghost btn-sm edit-cust-btn" data-id="${c.id}" title="Sửa">
            ${IcoEdit}
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  const pagContainer = document.getElementById('customer-pagination-container');
  if (pagContainer) {
    pagContainer.innerHTML = Pagination.render(filtered.length, currentPage, itemsPerPage, 'changeCustomerPage');
  }

  tbody.querySelectorAll('.view-cust-btn').forEach(btn => {
    btn.addEventListener('click', () => openHistory(btn.dataset.id));
  });
  tbody.querySelectorAll('.edit-cust-btn').forEach(btn => {
    btn.addEventListener('click', () => openForm(customers.find(c => c.id == btn.dataset.id)));
  });
};

const openHistory = async (id) => {
  const res = await api.get(`/api/customers/${id}/orders`).catch(e => { Toast.error(e.message); return null; });
  if (!res?.success) return;

  const { customer, orders } = res.data;

  Modal.open({
    title: `${customer.full_name} – Lịch sử mua hàng`,
    size: 'lg',
    cancelText: 'Đóng',
    content: `
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px">
        <div class="stat-mini-card">
          <div class="stat-label">SĐT</div>
          <div class="stat-value">${customer.phone}</div>
        </div>
        <div class="stat-mini-card">
          <div class="stat-label">Số đơn</div>
          <div class="stat-value" style="color:var(--primary)">${fmt(customer.total_orders)}</div>
        </div>
        <div class="stat-mini-card">
          <div class="stat-label">Tổng chi tiêu</div>
          <div class="stat-value" style="color:var(--success)">${fmtCurrency(customer.total_spent)}</div>
        </div>
      </div>
      <h4 style="margin-bottom:12px;font-size:0.9rem;color:var(--ink-mute)">Lịch sử đơn hàng</h4>
      ${!orders.length ? `<div class="empty-state"><div class="icon">${IcoReceipt}</div><p>Chưa có đơn hàng nào</p></div>` : `
        <div class="table-wrapper" style="max-height:300px;overflow-y:auto">
          <table>
            <thead><tr><th>Mã HĐ</th><th>Tổng tiền</th><th>Trạng thái</th><th>Thời gian</th></tr></thead>
            <tbody>
              ${orders.map(o => `
                <tr>
                  <td><strong>#${String(o.id).padStart(6,'0')}</strong></td>
                  <td class="currency">${fmtCurrency(o.total)}</td>
                  <td>
                    ${o.payment_status === 'paid'
                      ? '<span class="badge badge-success">✓ Đã TT</span>'
                      : o.payment_status === 'cancelled'
                        ? '<span class="badge badge-danger">✗ Hủy</span>'
                        : '<span class="badge badge-warning">Chờ</span>'
                    }
                  </td>
                  <td class="text-muted" style="font-size:0.8rem">${fmtDate(o.created_at)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `}
    `,
  });
};

const openForm = (customer = null) => {
  const isEdit = !!customer;
  let previewUrl = customer?.avatar_url || '';

  Modal.open({
    title: isEdit ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng',
    content: `
      <form id="customer-form" enctype="multipart/form-data">
        <div class="form-group">
          <label class="form-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            Số điện thoại *
          </label>
          <input class="form-control" id="cf-phone" type="tel" value="${customer?.phone || ''}" placeholder="09xxxxxxxx" ${isEdit ? 'readonly' : ''} />
        </div>
        <div class="form-group">
          <label class="form-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Họ và tên *
          </label>
          <input class="form-control" id="cf-name" value="${customer?.full_name || ''}" placeholder="Tên khách hàng" />
        </div>
        <div class="form-group">
          <label class="form-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            Ảnh đại diện
          </label>
          <div class="image-upload-zone" id="cf-upload-zone" style="min-height: 100px;">
            <input type="file" id="cf-avatar" accept="image/*" style="display:none;" />
            <div class="upload-zone-prompt" id="cf-upload-prompt" style="${previewUrl ? 'display:none;' : ''}">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <span>Kéo thả ảnh hoặc click để chọn</span>
            </div>
            <div id="cf-preview">
              ${previewUrl ? `<img src="${previewUrl}" class="img-preview" id="cf-preview-tag" style="max-height: 100px; border-radius: 50%; width: 100px; height: 100px; object-fit: cover;" />` : ''}
            </div>
          </div>
        </div>
      </form>
    `,
    confirmText: isEdit ? 'Cập nhật' : 'Tạo khách hàng',
    onConfirm: async () => {
      const phone = document.getElementById('cf-phone')?.value.trim();
      const full_name = document.getElementById('cf-name')?.value.trim();
      const avatarFile = document.getElementById('cf-avatar')?.files[0];

      if (!phone || !full_name) { Toast.warning('Vui lòng điền đầy đủ thông tin.'); return; }

      const fd = new FormData();
      fd.append('phone', phone);
      fd.append('full_name', full_name);
      if (avatarFile) fd.append('avatar', avatarFile);

      let res;
      if (isEdit) {
        res = await api.uploadPut(`/api/customers/${customer.id}`, fd).catch(e => { Toast.error(e.message); return null; });
      } else {
        res = await api.upload('/api/customers', fd).catch(e => { Toast.error(e.message); return null; });
      }

      if (res?.success) {
        Toast.success(isEdit ? 'Cập nhật khách hàng thành công!' : 'Tạo khách hàng thành công!');
        Modal.close();
        await loadCustomers();
      } else {
        Toast.error(res?.message || 'Có lỗi xảy ra.');
      }
    },
  });

  setTimeout(() => {
    const zone = document.getElementById('cf-upload-zone');
    const input = document.getElementById('cf-avatar');
    const prompt = document.getElementById('cf-upload-prompt');
    const preview = document.getElementById('cf-preview');

    if (zone && input) {
      zone.addEventListener('click', () => input.click());

      zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('dragover');
      });

      zone.addEventListener('dragleave', () => {
        zone.classList.remove('dragover');
      });

      zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
          input.files = e.dataTransfer.files;
          handleFile(e.dataTransfer.files[0]);
        }
      });

      input.addEventListener('change', (e) => {
        if (e.target.files.length) {
          handleFile(e.target.files[0]);
        }
      });
    }

    function handleFile(file) {
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (preview) {
            preview.innerHTML = `<img src="${ev.target.result}" class="img-preview" id="cf-preview-tag" style="max-height: 100px; border-radius: 50%; width: 100px; height: 100px; object-fit: cover;" />`;
          }
          if (prompt) prompt.style.display = 'none';
        };
        reader.readAsDataURL(file);
      }
    }
  }, 100);
};

const loadCustomers = async () => {
  const params = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
  const res = await api.get(`/api/customers${params}`).catch(() => null);
  customers = res?.data || [];
  currentPage = 1;
  renderTable();
};

export const init = async () => {
  let debounce;
  document.getElementById('cust-search')?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    clearTimeout(debounce);
    debounce = setTimeout(loadCustomers, 400);
  });
  
  document.getElementById('cust-filter-spent')?.addEventListener('change', (e) => {
    filterSpent = e.target.value;
    currentPage = 1;
    renderTable();
  });

  document.getElementById('cust-filter-orders')?.addEventListener('change', (e) => {
    filterOrders = e.target.value;
    currentPage = 1;
    renderTable();
  });

  document.getElementById('add-customer-btn')?.addEventListener('click', () => openForm());
  document.getElementById('export-customer-excel-btn')?.addEventListener('click', () => {
    const token = localStorage.getItem('cafe_token');
    window.open(`/api/reports/export/excel?tab=customers&token=${token}`, '_blank');
  });

  await loadCustomers();
};
