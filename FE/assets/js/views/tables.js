/**
 * tables.js — View sơ đồ bàn
 */
import { api } from '../api.js';
import { Toast } from '../components/toast.js';
import { Modal } from '../components/modal.js';
import { Confirm } from '../components/confirm.js';

// SVG Icons
const IcoPlus  = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
const IcoEdit  = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
const IcoTrash = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`;
const IcoMap   = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>`;

const fmtCurrency = (n) => new Intl.NumberFormat('vi-VN').format(n || 0) + ' VNĐ';
let tablesData = [];
const user = JSON.parse(localStorage.getItem('cafe_user'));

export const render = () => `
  <div class="page">
    <!-- Filter Bar -->
    <div class="filter-bar" style="margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
      <div style="display:flex; gap:6px;">
        <button class="btn btn-secondary btn-sm filter-area-btn active" data-area="all">Tất cả khu vực</button>
        <button class="btn btn-secondary btn-sm filter-area-btn" data-area="indoor">Trong nhà</button>
        <button class="btn btn-secondary btn-sm filter-area-btn" data-area="outdoor">Sân vườn</button>
        <button class="btn btn-secondary btn-sm filter-area-btn" data-area="vip">Phòng VIP</button>
      </div>
      ${user?.role === 'admin' ? `
        <button class="btn btn-primary btn-sm" id="add-table-btn" style="height:34px; display:inline-flex; align-items:center;">
          ${IcoPlus} Thêm bàn
        </button>
      ` : ''}
    </div>

    <!-- Sơ đồ bàn Grid -->
    <div class="tables-grid" id="tables-container">
      <div class="empty-state">Đang tải danh sách bàn...</div>
    </div>
  </div>
`;

export const init = async () => {
  await fetchTables();

  document.querySelectorAll('.filter-area-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-area-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderTables(btn.dataset.area);
    });
  });

  document.getElementById('add-table-btn')?.addEventListener('click', openAddTableModal);
};

const fetchTables = async () => {
  try {
    const res = await api.get('/api/tables');
    if (res.success) {
      tablesData = res.data;
      renderTables('all');
    }
  } catch (err) {
    Toast.error('Không thể tải sơ đồ bàn.');
  }
};

const renderTables = (areaFilter) => {
  const container = document.getElementById('tables-container');
  if (!container) return;

  const filtered = areaFilter === 'all' ? tablesData : tablesData.filter(t => t.area === areaFilter);

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <div class="icon">${IcoMap}</div>
        <p>Không có bàn nào thuộc khu vực này.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(t => {
    let statusClass = 'status-available';
    let statusLabel = 'Trống';
    if (t.status === 'occupied') {
      statusClass = 'status-occupied';
      statusLabel = 'Có khách';
    } else if (t.status === 'reserved') {
      statusClass = 'status-reserved';
      statusLabel = 'Đã đặt trước';
    }

    return `
      <div class="table-card ${statusClass}" data-id="${t.id}">
        <div class="table-card-header">
          <span class="table-area-badge">${t.area.toUpperCase()}</span>
          <span class="table-status-dot"></span>
        </div>
        <div class="table-card-body">
          <div class="table-name" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${t.name}</div>
          <div class="table-capacity">Sức chứa: ${t.capacity} người</div>
          <div class="table-status-text">${statusLabel}</div>
        </div>
        <div class="table-card-actions" style="flex-wrap:wrap; gap:4px;">
          <button class="btn btn-secondary btn-sm view-table-order-btn" data-id="${t.id}" data-status="${t.status}" style="font-size:11px; padding:4px 8px;">Chi tiết</button>
          ${user?.role === 'admin' ? `
            <div style="display:flex; gap:4px; margin-left:auto;">
              <button class="btn btn-ghost btn-sm edit-table-btn" data-id="${t.id}" title="Sửa">${IcoEdit}</button>
              <button class="btn btn-ghost btn-sm delete-table-btn" data-id="${t.id}" title="Xóa" style="color:var(--error);">${IcoTrash}</button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.view-table-order-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      showTableDetails(btn.dataset.id, btn.dataset.status);
    });
  });

  container.querySelectorAll('.edit-table-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openEditTableModal(btn.dataset.id);
    });
  });

  container.querySelectorAll('.delete-table-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const confirmed = await Confirm.ask('Bạn có chắc chắn muốn xóa bàn này?', true);
      if (confirmed) deleteTable(btn.dataset.id);
    });
  });
};

const showTableDetails = async (id, status) => {
  const table = tablesData.find(t => t.id == id);
  if (!table) return;

  if (status !== 'occupied') {
    Modal.open({
      title: `${table.name} - Trạng thái`,
      content: `
        <div class="form-group">
          <label class="form-label">Cập nhật trạng thái bàn</label>
          <select class="form-control" id="update-table-status-select">
            <option value="available" ${status === 'available' ? 'selected' : ''}>Trống (Available)</option>
            <option value="reserved" ${status === 'reserved' ? 'selected' : ''}>Đã đặt trước (Reserved)</option>
          </select>
        </div>
      `,
      onConfirm: async () => {
        const newStatus = document.getElementById('update-table-status-select').value;
        try {
          const res = await api.patch(`/api/tables/${id}/status`, { status: newStatus });
          if (res.success) { Toast.success('Cập nhật trạng thái bàn thành công.'); fetchTables(); }
        } catch (err) {
          Toast.error(err.message || 'Cập nhật thất bại.');
        }
      }
    });
    return;
  }

  try {
    const res = await api.get(`/api/tables/${id}/current-order`);
    if (res.success && res.data) {
      const { order, items } = res.data;
      Modal.open({
        title: `${table.name} - Đơn hàng đang mở`,
        content: `
          <div style="font-size: 14px;">
            <div style="margin-bottom:12px; display:flex; justify-content:space-between;">
              <span>Mã đơn: <strong>${order.order_code}</strong></span>
              <span>Tổng cộng: <strong style="color:var(--primary);">${fmtCurrency(order.total)}</strong></span>
            </div>
            <div class="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th style="text-align:center">SL</th>
                    <th style="text-align:right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  ${items.map(i => `
                    <tr>
                      <td>${i.product_name_snapshot}</td>
                      <td style="text-align:center">${i.quantity}</td>
                      <td style="text-align:right">${fmtCurrency(i.subtotal)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            <div style="margin-top:16px; display:flex; justify-content:flex-end;">
              <a href="#pos" class="btn btn-primary btn-sm" onclick="Modal.close()">Đi tới POS</a>
            </div>
          </div>
        `,
        size: 'md'
      });
    } else {
      Modal.open({
        title: `${table.name} - Trạng thái`,
        content: `
          <div style="font-size: 14px; text-align: center; padding: 12px 0;">
            <p style="color: var(--ink); margin-bottom: 16px;">Bàn này đang ở trạng thái <strong>Có khách</strong> nhưng không có hóa đơn chưa thanh toán nào.</p>
            <p style="color: var(--ink-mute); font-size: 13px; margin-bottom: 20px;">Bạn có muốn giải phóng bàn này (chuyển sang trạng thái Trống) không?</p>
            <button class="btn btn-primary btn-sm" id="free-table-now-btn" style="width: 100%; height: 38px; display: inline-flex; align-items: center; justify-content: center;">Giải phóng bàn (Đánh dấu Trống)</button>
          </div>
        `,
        hideFooter: true,
      });

      document.getElementById('free-table-now-btn')?.addEventListener('click', async () => {
        try {
          const patchRes = await api.patch(`/api/tables/${id}/status`, { status: 'available' });
          if (patchRes.success) {
            Toast.success('Giải phóng bàn thành công.');
            Modal.close();
            fetchTables();
          }
        } catch (err) {
          Toast.error(err.message || 'Giải phóng bàn thất bại.');
        }
      });
    }
  } catch (err) {
    Toast.error('Không thể lấy chi tiết hóa đơn tại bàn.');
  }
};

const openAddTableModal = () => {
  Modal.open({
    title: 'Thêm bàn mới',
    content: `
      <form id="add-table-form">
        <div class="form-group">
          <label class="form-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>
            Tên bàn
          </label>
          <input class="form-control" type="text" id="new-table-name" placeholder="Ví dụ: Bàn 5" required />
        </div>
        <div class="form-group">
          <label class="form-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Khu vực
          </label>
          <select class="form-control" id="new-table-area">
            <option value="indoor">Trong nhà (Indoor)</option>
            <option value="outdoor">Sân vườn (Outdoor)</option>
            <option value="vip">Phòng VIP</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Sức chứa (Người)
          </label>
          <input class="form-control" type="number" id="new-table-capacity" min="1" value="4" required />
        </div>
      </form>
    `,
    onConfirm: async () => {
      const name = document.getElementById('new-table-name').value.trim();
      const area = document.getElementById('new-table-area').value;
      const capacity = parseInt(document.getElementById('new-table-capacity').value);

      if (!name) return Toast.warning('Tên bàn không được trống.');

      try {
        const res = await api.post('/api/tables', { name, area, capacity });
        if (res.success) { Toast.success('Thêm bàn thành công!'); fetchTables(); }
      } catch (err) {
        Toast.error(err.message || 'Thêm bàn thất bại.');
      }
    }
  });
};

const openEditTableModal = (id) => {
  const table = tablesData.find(t => t.id == id);
  if (!table) return;

  Modal.open({
    title: 'Chỉnh sửa bàn',
    content: `
      <form id="edit-table-form">
        <div class="form-group">
          <label class="form-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>
            Tên bàn
          </label>
          <input class="form-control" type="text" id="edit-table-name" value="${table.name}" required />
        </div>
        <div class="form-group">
          <label class="form-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Khu vực
          </label>
          <select class="form-control" id="edit-table-area">
            <option value="indoor" ${table.area === 'indoor' ? 'selected' : ''}>Trong nhà (Indoor)</option>
            <option value="outdoor" ${table.area === 'outdoor' ? 'selected' : ''}>Sân vườn (Outdoor)</option>
            <option value="vip" ${table.area === 'vip' ? 'selected' : ''}>Phòng VIP</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Sức chứa (Người)
          </label>
          <input class="form-control" type="number" id="edit-table-capacity" value="${table.capacity}" min="1" required />
        </div>
      </form>
    `,
    onConfirm: async () => {
      const name = document.getElementById('edit-table-name').value.trim();
      const area = document.getElementById('edit-table-area').value;
      const capacity = parseInt(document.getElementById('edit-table-capacity').value);

      if (!name) return Toast.warning('Tên bàn không được trống.');

      try {
        const res = await api.put(`/api/tables/${id}`, { name, area, capacity });
        if (res.success) { Toast.success('Chỉnh sửa bàn thành công!'); fetchTables(); }
      } catch (err) {
        Toast.error(err.message || 'Cập nhật bàn thất bại.');
      }
    }
  });
};

const deleteTable = async (id) => {
  try {
    const res = await api.delete(`/api/tables/${id}`);
    if (res.success) { Toast.success('Xóa bàn thành công.'); fetchTables(); }
  } catch (err) {
    Toast.error(err.message || 'Xóa bàn thất bại.');
  }
};
