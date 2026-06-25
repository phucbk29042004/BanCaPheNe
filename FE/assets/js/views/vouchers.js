/**
 * vouchers.js — View quản lý mã giảm giá
 */
import { api } from '../api.js';
import { Toast } from '../components/toast.js';
import { Modal } from '../components/modal.js';
import { Confirm } from '../components/confirm.js';
import { Pagination } from '../components/pagination.js';

// SVG Icons
const IcoPlus    = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
const IcoSearch  = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
const IcoEdit    = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
const IcoTrash   = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`;
const IcoTag     = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`;
const IcoList    = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`;

const fmtCurrency = (n) => new Intl.NumberFormat('vi-VN').format(n || 0) + ' VNĐ';

const formatMoneyInput = (inputEl) => {
  if (!inputEl) return;
  inputEl.type = 'text';
  const format = (value) => {
    let val = String(value).replace(/\D/g, "");
    if (!val) return "";
    return new Intl.NumberFormat('vi-VN').format(parseInt(val)) + ' VNĐ';
  };
  if (inputEl.value) {
    inputEl.value = format(inputEl.value);
  }
  inputEl.addEventListener('input', (e) => {
    const start = e.target.selectionStart;
    const oldLength = e.target.value.length;
    e.target.value = format(e.target.value);
    const newLength = e.target.value.length;
    e.target.setSelectionRange(start + (newLength - oldLength), start + (newLength - oldLength));
  });
};

const parseMoneyInput = (value) => {
  if (!value) return 0;
  return parseInt(String(value).replace(/\D/g, "")) || 0;
};

let vouchersData = [];
let searchQuery = '';
let filteredVouchers = [];
let currentPage = 1;
const itemsPerPage = 10;

window.changeVoucherPage = (page) => {
  currentPage = page;
  renderVouchers();
};

const fmtDate = (d) => {
  if (!d) return '';
  const date = new Date(d);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const fmtOnlyDate = (dStr) => {
  if (!dStr) return '';
  const date = new Date(dStr);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
};

export const render = () => `
  <div class="page">
    <div class="filter-bar" style="margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; gap:10px;">
      <div class="search-input-wrap" style="flex:1; max-width:320px;">
        <span class="icon">${IcoSearch}</span>
        <input class="form-control" type="text" id="voucher-search" placeholder="Tìm theo mã voucher..." />
      </div>
      <button class="btn btn-primary btn-sm" id="add-voucher-btn" style="height:36px; display:inline-flex; align-items:center;">
        ${IcoPlus} Thêm Voucher
      </button>
    </div>

    <!-- Vouchers Grid -->
    <div class="vouchers-grid" id="vouchers-list">
      <div class="text-center text-muted" style="grid-column: 1/-1; padding: 24px;">Đang tải danh sách khuyến mãi...</div>
    </div>
    <div id="voucher-pagination-container"></div>
  </div>
`;

export const init = async () => {
  await fetchVouchers();
  document.getElementById('add-voucher-btn')?.addEventListener('click', openAddVoucherModal);
  document.getElementById('voucher-search')?.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    filteredVouchers = searchQuery
      ? vouchersData.filter(v => v.code.toLowerCase().includes(searchQuery) || (v.description || '').toLowerCase().includes(searchQuery))
      : [...vouchersData];
    currentPage = 1;
    renderVouchers();
  });
};

const fetchVouchers = async () => {
  try {
    const res = await api.get('/api/vouchers');
    if (res.success) {
      vouchersData = res.data;
      filteredVouchers = [...vouchersData];
      currentPage = 1;
      renderVouchers();
    }
  } catch (err) {
    Toast.error('Không thể lấy danh sách voucher.');
  }
};

const renderVouchers = () => {
  const container = document.getElementById('vouchers-list');
  if (!container) return;

  if (filteredVouchers.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; width: 100%;">
        <div class="empty-state"><div class="icon">${IcoTag}</div><p>Chưa có chương trình khuyến mãi nào.</p></div>
      </div>
    `;
    document.getElementById('voucher-pagination-container').innerHTML = '';
    return;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const sliced = filteredVouchers.slice(startIndex, startIndex + itemsPerPage);

  container.innerHTML = sliced.map(v => {
    const limitLabel = v.usage_limit ? `${v.used_count}/${v.usage_limit}` : `${v.used_count}/∞`;
    const typeLabel = v.type === 'percent' ? 'percent' : 'fixed';
    const valueLabel = v.type === 'percent' ? `${v.value}%` : fmtCurrency(v.value);

    return `
      <div class="voucher-card" data-id="${v.id}">
        <div class="voucher-badge ${typeLabel}">
          ${v.type === 'percent' ? 'Phần trăm' : 'Cố định'}
        </div>
        <div class="voucher-code">${v.code}</div>
        <div class="voucher-desc">${v.description || 'Không có mô tả'}</div>
        <div class="voucher-divider"></div>
        <div class="voucher-meta-row">
          <span>Giảm giá</span>
          <span class="voucher-meta-value text-primary" style="font-size:13.5px">${valueLabel}</span>
        </div>
        <div class="voucher-meta-row">
          <span>Đơn tối thiểu</span>
          <span class="voucher-meta-value">${fmtCurrency(v.min_order_amount)}</span>
        </div>
        <div class="voucher-meta-row">
          <span>Lượt dùng</span>
          <span class="voucher-meta-value">${limitLabel}</span>
        </div>
        <div class="voucher-actions">
          <label class="toggle-switch" style="pointer-events: auto">
            <input type="checkbox" class="toggle-status-checkbox" data-id="${v.id}" ${v.is_active ? 'checked' : ''} />
            <span class="toggle-thumb"></span>
          </label>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-secondary btn-sm view-usage-btn" data-id="${v.id}" title="Lịch sử dùng">
              ${IcoList}
            </button>
            <button class="btn btn-ghost btn-sm edit-voucher-btn" data-id="${v.id}" title="Sửa">
              ${IcoEdit}
            </button>
            <button class="btn btn-ghost btn-sm delete-voucher-btn" data-id="${v.id}" title="Xóa" style="color:var(--error)">
              ${IcoTrash}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const pagContainer = document.getElementById('voucher-pagination-container');
  if (pagContainer) {
    pagContainer.innerHTML = Pagination.render(filteredVouchers.length, currentPage, itemsPerPage, 'changeVoucherPage');
  }

  // Click card to open detail
  container.querySelectorAll('.voucher-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.voucher-actions') || e.target.closest('.toggle-switch')) {
        return;
      }
      openVoucherDetailModal(card.dataset.id);
    });
  });

  container.querySelectorAll('.toggle-status-checkbox').forEach(cb => {
    cb.addEventListener('change', (e) => {
      e.stopPropagation();
      toggleStatus(cb.dataset.id);
    });
  });

  container.querySelectorAll('.view-usage-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      showVoucherUsages(btn.dataset.id);
    });
  });

  container.querySelectorAll('.edit-voucher-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openEditVoucherModal(btn.dataset.id);
    });
  });

  container.querySelectorAll('.delete-voucher-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const confirmed = await Confirm.ask('Bạn có chắc chắn muốn xóa voucher này?', true);
      if (confirmed) deleteVoucher(btn.dataset.id);
    });
  });
};

const openVoucherDetailModal = (id) => {
  const v = vouchersData.find(item => item.id == id);
  if (!v) return;

  const validity = `${fmtOnlyDate(v.valid_from)} — ${fmtOnlyDate(v.valid_until)}`;
  const limitLabel = v.usage_limit ? `${v.used_count}/${v.usage_limit}` : `${v.used_count}/Vô hạn`;
  const typeLabel = v.type === 'percent' ? 'Phần trăm (%)' : 'Số tiền cố định';
  const valueLabel = v.type === 'percent' ? `${v.value}%` : fmtCurrency(v.value);

  Modal.open({
    title: `Chi tiết khuyến mãi: ${v.code}`,
    size: 'lg',
    content: `
      <div style="font-family:'Inter',sans-serif;font-size:14px;color:var(--ink);line-height:1.6">
        <div style="background:var(--canvas-lavender);padding:16px;border-radius:var(--radius-lg);margin-bottom:16px;text-align:center;border:1px solid var(--hairline)">
          <div style="font-size:12px;font-weight:700;color:var(--primary);text-transform:uppercase;margin-bottom:4px">Mã giảm giá</div>
          <div style="font-size:26px;font-weight:800;color:var(--primary);letter-spacing:1px">${v.code}</div>
          <div style="font-size:13px;color:var(--ink-mute);margin-top:6px">${v.description || 'Không có mô tả'}</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:0 4px">
          <div>
            <div style="color:var(--ink-mute);font-size:12px">Loại hình</div>
            <div style="font-weight:600">${typeLabel}</div>
          </div>
          <div>
            <div style="color:var(--ink-mute);font-size:12px">Mức giảm giá</div>
            <div style="font-weight:700;color:var(--primary)">${valueLabel}</div>
          </div>
          <div>
            <div style="color:var(--ink-mute);font-size:12px">Đơn tối thiểu</div>
            <div style="font-weight:600">${fmtCurrency(v.min_order_amount)}</div>
          </div>
          <div>
            <div style="color:var(--ink-mute);font-size:12px">Lượt sử dụng</div>
            <div style="font-weight:600">${limitLabel}</div>
          </div>
          <div style="grid-column: 1 / -1">
            <div style="color:var(--ink-mute);font-size:12px">Thời gian hiệu lực</div>
            <div style="font-weight:600">${validity}</div>
          </div>
          <div>
            <div style="color:var(--ink-mute);font-size:12px">Trạng thái</div>
            <div style="font-weight:600">${v.is_active ? '<span class="badge badge-success">Đang kích hoạt</span>' : '<span class="badge badge-danger">Đang khóa</span>'}</div>
          </div>
        </div>
        <div style="margin-top:20px;border-top:1px solid var(--hairline);padding-top:16px;display:flex;justify-content:flex-end;gap:8px">
          <button class="btn btn-secondary btn-sm" id="detail-view-usage-btn">Xem lịch sử dùng</button>
          <button class="btn btn-ghost btn-sm" id="detail-edit-btn">Chỉnh sửa</button>
        </div>
      </div>
    `,
    hideFooter: true
  });

  document.getElementById('detail-view-usage-btn')?.addEventListener('click', () => {
    Modal.close();
    showVoucherUsages(id);
  });
  document.getElementById('detail-edit-btn')?.addEventListener('click', () => {
    Modal.close();
    openEditVoucherModal(id);
  });
};

const toggleStatus = async (id) => {
  const res = await api.patch(`/api/vouchers/${id}/toggle`).catch(e => { Toast.error(e.message); return null; });
  if (res?.success) { Toast.success(res.message); await fetchVouchers(); }
};

const deleteVoucher = async (id) => {
  const res = await api.delete(`/api/vouchers/${id}`).catch(e => { Toast.error(e.message); return null; });
  if (res?.success) { Toast.success('Đã xóa voucher.'); await fetchVouchers(); }
};

const showVoucherUsages = async (id) => {
  const voucher = vouchersData.find(v => v.id == id);
  if (!voucher) return;

  try {
    const res = await api.get(`/api/vouchers/${id}/usages`);
    if (res.success) {
      const usages = res.data;
      Modal.open({
        title: `Lịch sử dùng: ${voucher.code}`,
        content: `
          <div style="font-size:14px; max-height: 400px; overflow-y: auto;">
            ${usages.length === 0 ? '<p class="text-muted text-center">Chưa có đơn hàng nào áp dụng voucher này.</p>' : `
              <table style="width:100%; border-collapse:collapse;">
                <thead>
                  <tr style="border-bottom:1px solid var(--hairline); text-align:left;">
                    <th style="padding:8px 0;">Mã đơn</th>
                    <th style="padding:8px 0;">Khách hàng</th>
                    <th style="padding:8px 0; text-align:right;">Số tiền giảm</th>
                    <th style="padding:8px 0; text-align:right;">Ngày dùng</th>
                  </tr>
                </thead>
                <tbody>
                  ${usages.map(u => `
                    <tr style="border-bottom:1px solid rgba(0,0,0,0.04);">
                      <td style="padding:8px 0;"><strong>${u.order_code}</strong></td>
                      <td style="padding:8px 0;">${u.customer_name || 'Khách vãng lai'}</td>
                      <td style="padding:8px 0; text-align:right; color:var(--primary); font-weight:700;">-${fmtCurrency(u.discount_applied)}</td>
                      <td style="padding:8px 0; text-align:right;"><small>${fmtDate(u.used_at)}</small></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            `}
          </div>
        `,
        size: 'lg'
      });
    }
  } catch (err) {
    Toast.error('Không thể lấy lịch sử sử dụng voucher.');
  }
};

const openAddVoucherModal = () => {
  Modal.open({
    title: 'Thêm Voucher mới',
    size: 'lg',
    content: `
      <form id="add-voucher-form">
        <div class="form-grid" style="margin-bottom:4px;">
          <div class="form-group span-2">
            <label class="form-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
              Mô tả chương trình
            </label>
            <input class="form-control" type="text" id="new-voucher-desc" placeholder="Giảm giá nhân ngày khai trương..." />
          </div>
          <div class="form-group">
            <label class="form-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
              Mã Voucher *
            </label>
            <input class="form-control" type="text" id="new-voucher-code" placeholder="QUANQUEN10" style="text-transform:uppercase;" required />
          </div>
          <div class="form-group">
            <label class="form-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
              Loại giảm giá
            </label>
            <select class="form-control" id="new-voucher-type">
              <option value="percent">Phần trăm (%)</option>
              <option value="fixed">Số tiền cố định (đ)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              Giá trị giảm *
            </label>
            <input class="form-control" type="text" id="new-voucher-value" placeholder="Ví dụ: 10 hoặc 50.000 VNĐ" required />
          </div>
          <div class="form-group">
            <label class="form-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              Đơn hàng tối thiểu
            </label>
            <input class="form-control" type="text" id="new-voucher-min" value="0" />
          </div>
          <div class="form-group">
            <label class="form-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              Giảm tối đa (phần trăm)
            </label>
            <input class="form-control" type="text" id="new-voucher-max" placeholder="Để trống = không giới hạn" />
          </div>
          <div class="form-group">
            <label class="form-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>
              Giới hạn lượt dùng
            </label>
            <input class="form-control" type="number" id="new-voucher-limit" min="1" placeholder="Để trống = vô hạn" />
          </div>
          <div class="form-group">
            <label class="form-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Hiệu lực từ *
            </label>
            <input class="form-control" type="datetime-local" id="new-voucher-from" required />
          </div>
          <div class="form-group">
            <label class="form-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Đến ngày *
            </label>
            <input class="form-control" type="datetime-local" id="new-voucher-until" required />
          </div>
        </div>
      </form>
    `,
    onConfirm: async () => {
      const code = document.getElementById('new-voucher-code').value.trim();
      const description = document.getElementById('new-voucher-desc').value.trim();
      const type = document.getElementById('new-voucher-type').value;
      const value = parseMoneyInput(document.getElementById('new-voucher-value').value);
      const min_order_amount = parseMoneyInput(document.getElementById('new-voucher-min').value);
      const max_discount_amount = parseMoneyInput(document.getElementById('new-voucher-max').value) || null;
      const usage_limit = parseInt(document.getElementById('new-voucher-limit').value || 0) || null;
      const valid_from = document.getElementById('new-voucher-from').value;
      const valid_until = document.getElementById('new-voucher-until').value;

      if (!code || isNaN(value) || !valid_from || !valid_until) {
        return Toast.warning('Vui lòng nhập đầy đủ thông tin bắt buộc.');
      }

      try {
        const res = await api.post('/api/vouchers', {
          code, description, type, value, min_order_amount, max_discount_amount, usage_limit, valid_from, valid_until
        });
        if (res.success) { Toast.success('Tạo mã voucher thành công!'); fetchVouchers(); }
      } catch (err) {
        Toast.error(err.message || 'Thêm voucher thất bại.');
      }
    }
  });

  // Apply auto formatting
  formatMoneyInput(document.getElementById('new-voucher-value'));
  formatMoneyInput(document.getElementById('new-voucher-min'));
  formatMoneyInput(document.getElementById('new-voucher-max'));
};

const openEditVoucherModal = (id) => {
  const v = vouchersData.find(item => item.id == id);
  if (!v) return;

  Modal.open({
    title: `Chỉnh sửa Voucher: ${v.code}`,
    size: 'lg',
    content: `
      <form id="edit-voucher-form">
        <div class="form-grid" style="margin-bottom:4px;">
          <div class="form-group span-2">
            <label class="form-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
              Mô tả chương trình
            </label>
            <input class="form-control" type="text" id="edit-voucher-desc" value="${v.description || ''}" />
          </div>
          <div class="form-group">
            <label class="form-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
              Loại giảm giá
            </label>
            <select class="form-control" id="edit-voucher-type">
              <option value="percent" ${v.type === 'percent' ? 'selected' : ''}>Phần trăm (%)</option>
              <option value="fixed" ${v.type === 'fixed' ? 'selected' : ''}>Số tiền cố định (đ)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              Giá trị giảm *
            </label>
            <input class="form-control" type="text" id="edit-voucher-value" value="${v.value}" required />
          </div>
          <div class="form-group">
            <label class="form-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              Đơn tối thiểu
            </label>
            <input class="form-control" type="text" id="edit-voucher-min" value="${v.min_order_amount}" />
          </div>
          <div class="form-group">
            <label class="form-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              Giảm tối đa
            </label>
            <input class="form-control" type="text" id="edit-voucher-max" value="${v.max_discount_amount || ''}" />
          </div>
          <div class="form-group">
            <label class="form-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>
              Giới hạn lượt dùng
            </label>
            <input class="form-control" type="number" id="edit-voucher-limit" value="${v.usage_limit || ''}" />
          </div>
          <div class="form-group">
            <label class="form-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Hiệu lực từ *
            </label>
            <input class="form-control" type="datetime-local" id="edit-voucher-from" value="${v.valid_from.replace(' ', 'T').substring(0, 16)}" required />
          </div>
          <div class="form-group">
            <label class="form-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Đến ngày *
            </label>
            <input class="form-control" type="datetime-local" id="edit-voucher-until" value="${v.valid_until.replace(' ', 'T').substring(0, 16)}" required />
          </div>
        </div>
      </form>
    `,
    onConfirm: async () => {
      const description = document.getElementById('edit-voucher-desc').value.trim();
      const type = document.getElementById('edit-voucher-type').value;
      const value = parseMoneyInput(document.getElementById('edit-voucher-value').value);
      const min_order_amount = parseMoneyInput(document.getElementById('edit-voucher-min').value);
      const max_discount_amount = parseMoneyInput(document.getElementById('edit-voucher-max').value) || null;
      const usage_limit = parseInt(document.getElementById('edit-voucher-limit').value || 0) || null;
      const valid_from = document.getElementById('edit-voucher-from').value;
      const valid_until = document.getElementById('edit-voucher-until').value;

      if (isNaN(value) || !valid_from || !valid_until) {
        return Toast.warning('Vui lòng điền giá trị giảm và hiệu lực thời gian.');
      }

      try {
        const res = await api.put(`/api/vouchers/${id}`, {
          description, type, value, min_order_amount, max_discount_amount, usage_limit, valid_from, valid_until
        });
        if (res.success) { Toast.success('Cập nhật voucher thành công!'); fetchVouchers(); }
      } catch (err) {
        Toast.error(err.message || 'Cập nhật voucher thất bại.');
      }
    }
  });

  // Apply auto formatting
  formatMoneyInput(document.getElementById('edit-voucher-value'));
  formatMoneyInput(document.getElementById('edit-voucher-min'));
  formatMoneyInput(document.getElementById('edit-voucher-max'));
};
