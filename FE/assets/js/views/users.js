/**
 * users.js — View quản lý nhân viên & lương
 */
import { api } from '../api.js';
import { Toast } from '../components/toast.js';
import { Modal } from '../components/modal.js';
import { Confirm } from '../components/confirm.js';
import { Pagination } from '../components/pagination.js';

// SVG Icons
const IcoPlus = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
const IcoEdit = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
const IcoTrash = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`;

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

let usersData = [];
let filteredUsers = [];
let currentPage = 1;
const itemsPerPage = 10;
let currentTab = 'nhansu'; // nhansu | taikhoan

window.changeUserPage = (page) => {
  currentPage = page;
  renderUsersTable();
};

let filterRole = '';
let filterActive = '';
let searchVal = '';

export const render = () => `
  <div class="page">
    <!-- Tabs Header -->
    <div class="tab-header-wrap" style="display:flex; border-bottom:1px solid var(--hairline); margin-bottom:16px; gap:8px;">
      <button class="tab-trigger ${currentTab === 'nhansu' ? 'active' : ''}" id="tab-nhansu-btn" style="padding:12px 20px; font-size:14px; font-weight:600; background:none; border:none; border-bottom:2px solid ${currentTab === 'nhansu' ? 'var(--primary)' : 'transparent'}; color:${currentTab === 'nhansu' ? 'var(--primary)' : 'var(--text-secondary)'}; cursor:pointer; transition:all 0.2s;">
        Nhân sự & Lương
      </button>
      <button class="tab-trigger ${currentTab === 'taikhoan' ? 'active' : ''}" id="tab-taikhoan-btn" style="padding:12px 20px; font-size:14px; font-weight:600; background:none; border:none; border-bottom:2px solid ${currentTab === 'taikhoan' ? 'var(--primary)' : 'transparent'}; color:${currentTab === 'taikhoan' ? 'var(--primary)' : 'var(--text-secondary)'}; cursor:pointer; transition:all 0.2s;">
        Tài khoản hệ thống
      </button>
    </div>

    <!-- Toolbar with search, filters & add action -->
    <div class="toolbar" style="margin-bottom:12px; display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap;">
      <div style="display:flex; gap:8px; flex:1; max-width:680px; flex-wrap:wrap;">
        <div class="search-wrap" style="position:relative; flex:1; min-width:180px;">
          <svg style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--ink-mute)" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input class="form-control" id="user-search" type="text" placeholder="Tìm theo tên hoặc tài khoản..." style="padding-left:34px; height:36px; font-size:14px;" />
        </div>
        <select class="form-control" id="user-filter-role" style="width:150px; height:36px;">
          <option value="">Vai trò (Tất cả)</option>
          <option value="admin">Quản lý (Admin)</option>
          <option value="staff">Nhân viên (Staff)</option>
        </select>
        <select class="form-control" id="user-filter-active" style="width:170px; height:36px;">
          <option value="">Trạng thái (Tất cả)</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Đang khóa</option>
        </select>
      </div>
      <button class="btn btn-primary btn-sm" id="add-user-btn" style="height:36px; display:inline-flex; align-items:center; gap:6px;">
        ${IcoPlus} <span id="add-btn-text">${currentTab === 'nhansu' ? 'Thêm nhân viên' : 'Thêm tài khoản'}</span>
      </button>
    </div>

    <!-- Users Container -->
    <div class="users-grid" id="users-list">
      <div class="text-center text-muted" style="grid-column: 1/-1; padding: 24px;">Đang tải danh sách...</div>
    </div>
    <div id="user-pagination-container"></div>
  </div>
`;

const applyFilters = () => {
  filteredUsers = usersData.filter(u => {
    const matchSearch = !searchVal || 
      u.username.toLowerCase().includes(searchVal) || 
      u.full_name.toLowerCase().includes(searchVal);
      
    const matchRole = !filterRole || u.role === filterRole;
    
    let matchActive = true;
    if (filterActive === 'active') matchActive = u.is_active === 1 || u.is_active === true;
    else if (filterActive === 'inactive') matchActive = u.is_active === 0 || u.is_active === false;
    
    return matchSearch && matchRole && matchActive;
  });
};

export const init = async () => {
  await fetchUsers();
  
  // Tab click listeners
  const btnNhansu = document.getElementById('tab-nhansu-btn');
  const btnTaikhoan = document.getElementById('tab-taikhoan-btn');
  const addBtnText = document.getElementById('add-btn-text');

  btnNhansu?.addEventListener('click', () => {
    currentTab = 'nhansu';
    btnNhansu.style.borderColor = 'var(--primary)';
    btnNhansu.style.color = 'var(--primary)';
    if (btnTaikhoan) {
      btnTaikhoan.style.borderColor = 'transparent';
      btnTaikhoan.style.color = 'var(--text-secondary)';
    }
    if (addBtnText) addBtnText.textContent = 'Thêm nhân viên';
    currentPage = 1;
    renderUsersTable();
  });

  btnTaikhoan?.addEventListener('click', () => {
    currentTab = 'taikhoan';
    btnTaikhoan.style.borderColor = 'var(--primary)';
    btnTaikhoan.style.color = 'var(--primary)';
    if (btnNhansu) {
      btnNhansu.style.borderColor = 'transparent';
      btnNhansu.style.color = 'var(--text-secondary)';
    }
    if (addBtnText) addBtnText.textContent = 'Thêm tài khoản';
    currentPage = 1;
    renderUsersTable();
  });

  document.getElementById('add-user-btn')?.addEventListener('click', openAddUserModal);
  
  document.getElementById('user-search')?.addEventListener('input', (e) => {
    searchVal = e.target.value.toLowerCase();
    applyFilters();
    currentPage = 1;
    renderUsersTable();
  });

  document.getElementById('user-filter-role')?.addEventListener('change', (e) => {
    filterRole = e.target.value;
    applyFilters();
    currentPage = 1;
    renderUsersTable();
  });

  document.getElementById('user-filter-active')?.addEventListener('change', (e) => {
    filterActive = e.target.value;
    applyFilters();
    currentPage = 1;
    renderUsersTable();
  });
};

const fetchUsers = async () => {
  try {
    const res = await api.get('/api/users');
    if (res.success) {
      usersData = res.data;
      applyFilters();
      currentPage = 1;
      renderUsersTable();
    }
  } catch (err) {
    Toast.error('Không thể lấy danh sách tài khoản.');
  }
};

const renderUsersTable = () => {
  const container = document.getElementById('users-list');
  if (!container) return;

  if (filteredUsers.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; width: 100%;">
        <div class="empty-state"><p>Không tìm thấy bản ghi nào.</p></div>
      </div>
    `;
    const pagContainer = document.getElementById('user-pagination-container');
    if (pagContainer) pagContainer.innerHTML = '';
    return;
  }

  // Calculate slice
  const startIndex = (currentPage - 1) * itemsPerPage;
  const slicedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  if (currentTab === 'nhansu') {
    // Layout dạng Card phục vụ Nhân sự & Lương
    container.style.display = 'grid';
    container.innerHTML = slicedUsers.map(u => {
      const roleLabel = u.role === 'admin' ? 'Quản lý' : 'Nhân viên';
      const initial = u.full_name ? u.full_name.charAt(0).toUpperCase() : 'U';

      return `
        <div class="user-card" data-id="${u.id}" style="cursor:pointer; display:flex; flex-direction:column;">
          <div style="flex-grow:1; display:flex; flex-direction:column; align-items:center;">
            ${u.avatar_url ? `
              <img src="${u.avatar_url}" class="user-avatar" style="object-fit:cover; border: 2px solid var(--primary-light);" />
            ` : `
              <div class="user-avatar">${initial}</div>
            `}
            <div class="user-name">${u.full_name}</div>
            <div class="user-username">@${u.username}</div>
            <span class="user-role-badge badge ${u.role === 'admin' ? 'badge-primary' : 'badge-info'}" style="margin-bottom:16px;">
              ${roleLabel}
            </span>
            <div class="user-info-item">
              <span class="user-info-label">SĐT</span>
              <span class="user-info-val">${u.phone || '-'}</span>
            </div>
            <div class="user-info-item" style="border-bottom:none;">
              <span class="user-info-label">Lương/giờ</span>
              <span class="user-info-val text-primary" style="font-weight:700;">${fmtCurrency(u.hourly_rate)}</span>
            </div>
          </div>
          <div class="user-actions" style="margin-top:auto; width:100%;">
            <label class="toggle-switch" style="pointer-events: auto">
              <input type="checkbox" class="toggle-user-checkbox" data-id="${u.id}" ${u.is_active ? 'checked' : ''} />
              <span class="toggle-thumb"></span>
            </label>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-secondary btn-sm view-salary-btn" data-id="${u.id}">Lương</button>
              <button class="btn btn-ghost btn-sm edit-user-btn" data-id="${u.id}" title="Sửa">${IcoEdit}</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } else {
    // Layout dạng Bảng / Card đẹp mắt phục vụ "Tài khoản hệ thống"
    container.style.display = 'grid';
    container.innerHTML = slicedUsers.map(u => {
      const roleLabel = u.role === 'admin' ? 'Quản trị viên' : 'Nhân viên thu ngân';
      const initial = u.username ? u.username.substring(0, 2).toUpperCase() : 'US';

      return `
        <div class="user-card" data-id="${u.id}" style="display:flex; flex-direction:column;">
          <div style="flex-grow:1; width:100%;">
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
              ${u.avatar_url ? `
                <img src="${u.avatar_url}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; flex-shrink:0; border: 1px solid var(--hairline);" />
              ` : `
                <div class="user-avatar" style="width:40px; height:40px; font-size:16px; margin:0; flex-shrink:0;">${initial}</div>
              `}
              <div style="overflow:hidden; text-align:left;">
                <div style="font-weight:700; color:var(--ink); font-size:14px; text-overflow:ellipsis; white-space:nowrap; overflow:hidden;">${u.full_name}</div>
                <div style="font-size:12px; color:var(--ink-mute);">@${u.username}</div>
              </div>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <span class="badge ${u.role === 'admin' ? 'badge-primary' : 'badge-info'}" style="font-size:11px;">
                ${roleLabel}
              </span>
              <span class="badge ${u.is_active ? 'badge-success' : 'badge-danger'}" style="font-size:11px;">
                ${u.is_active ? 'Đang hoạt động' : 'Bị khóa'}
              </span>
            </div>
          </div>
          <div style="border-top:1px solid var(--hairline); padding-top:12px; display:flex; justify-content:space-between; align-items:center; margin-top:auto; width:100%;">
            <div style="display:flex; align-items:center; gap:4px;">
              <span style="font-size:11px; color:var(--ink-mute);">Trạng thái:</span>
              <label class="toggle-switch" style="transform:scale(0.85); origin:left center;">
                <input type="checkbox" class="toggle-user-checkbox" data-id="${u.id}" ${u.is_active ? 'checked' : ''} />
                <span class="toggle-thumb"></span>
              </label>
            </div>
            <div style="display:flex; gap:4px;">
              <button class="btn btn-ghost btn-sm edit-user-btn" data-id="${u.id}" title="Chỉnh sửa tài khoản" style="padding:6px; color:var(--text-secondary);">
                ${IcoEdit}
              </button>
              <button class="btn btn-ghost btn-sm delete-user-btn" data-id="${u.id}" title="Xóa tài khoản" style="padding:6px; color:var(--danger);">
                ${IcoTrash}
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Render pagination controls
  const pagContainer = document.getElementById('user-pagination-container');
  if (pagContainer) {
    pagContainer.innerHTML = Pagination.render(filteredUsers.length, currentPage, itemsPerPage, 'changeUserPage');
  }

  // Click card to open detail
  container.querySelectorAll('.user-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.user-actions') || e.target.closest('.toggle-switch') || e.target.closest('.delete-user-btn') || e.target.closest('.edit-user-btn') || e.target.closest('.view-salary-btn')) {
        return;
      }
      openUserDetailModal(card.dataset.id);
    });
  });

  // Add event listeners
  container.querySelectorAll('.toggle-user-checkbox').forEach(cb => {
    cb.addEventListener('change', (e) => {
      e.stopPropagation();
      toggleUserStatus(cb.dataset.id);
    });
  });

  container.querySelectorAll('.view-salary-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      showSalaryHistory(btn.dataset.id);
    });
  });

  container.querySelectorAll('.edit-user-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openEditUserModal(btn.dataset.id);
    });
  });

  container.querySelectorAll('.delete-user-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteUser(btn.dataset.id);
    });
  });
};

const openUserDetailModal = (id) => {
  const u = usersData.find(item => item.id == id);
  if (!u) return;

  const roleLabel = u.role === 'admin' ? 'Quản lý' : 'Nhân viên';
  const initial = u.full_name ? u.full_name.charAt(0).toUpperCase() : 'U';

  Modal.open({
    title: `Chi tiết nhân sự: ${u.full_name}`,
    content: `
      <div style="font-family:'Inter',sans-serif;font-size:14px;color:var(--ink);line-height:1.6">
        <div style="display:flex;flex-direction:column;align-items:center;margin-bottom:16px;background:var(--canvas-lavender);padding:16px;border-radius:var(--radius-lg);border:1px solid var(--hairline)">
          ${u.avatar_url ? `
            <img src="${u.avatar_url}" class="user-avatar" style="width:64px;height:64px;margin-bottom:8px;object-fit:cover;border:2px solid var(--primary-light)" />
          ` : `
            <div class="user-avatar" style="width:64px;height:64px;font-size:24px;margin-bottom:8px">${initial}</div>
          `}
          <div style="font-size:18px;font-weight:700;color:var(--ink)">${u.full_name}</div>
          <div style="font-size:13px;color:var(--ink-mute)">@${u.username}</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:0 4px">
          <div>
            <div style="color:var(--ink-mute);font-size:12px">Vai trò</div>
            <div style="font-weight:600">${roleLabel}</div>
          </div>
          <div>
            <div style="color:var(--ink-mute);font-size:12px">Lương/giờ</div>
            <div style="font-weight:700;color:var(--primary)">${fmtCurrency(u.hourly_rate)}</div>
          </div>
          <div>
            <div style="color:var(--ink-mute);font-size:12px">Số điện thoại</div>
            <div style="font-weight:600">${u.phone || 'Chưa cập nhật'}</div>
          </div>
          <div>
            <div style="color:var(--ink-mute);font-size:12px">Trạng thái</div>
            <div style="font-weight:600">${u.is_active ? '<span class="badge badge-success">Đang hoạt động</span>' : '<span class="badge badge-danger">Đang khóa</span>'}</div>
          </div>
        </div>
        <div style="margin-top:20px;border-top:1px solid var(--hairline);padding-top:16px;display:flex;justify-content:flex-end;gap:8px">
          <button class="btn btn-secondary btn-sm" id="detail-salary-btn">Lịch sử lương</button>
          <button class="btn btn-ghost btn-sm" id="detail-edit-btn">Chỉnh sửa</button>
        </div>
      </div>
    `,
    hideFooter: true
  });

  document.getElementById('detail-salary-btn')?.addEventListener('click', () => {
    Modal.close();
    showSalaryHistory(id);
  });
  document.getElementById('detail-edit-btn')?.addEventListener('click', () => {
    Modal.close();
    openEditUserModal(id);
  });
};

const toggleUserStatus = async (id) => {
  try {
    const res = await api.patch(`/api/users/${id}/toggle`);
    if (res.success) {
      Toast.success(res.message);
      fetchUsers();
    }
  } catch (err) {
    Toast.error('Không thể cập nhật trạng thái tài khoản.');
  }
};

const showSalaryHistory = async (id) => {
  const user = usersData.find(u => u.id == id);
  if (!user) return;

  try {
    const res = await api.get(`/api/users/${id}/salary`);
    if (res.success) {
      const salary = res.data;
      Modal.open({
        title: `Lịch sử lương tháng: ${user.full_name}`,
        content: `
          <div style="font-size: 14px;">
            ${salary.length === 0 ? '<p class="text-muted text-center">Chưa ghi nhận ca làm hoàn thành nào có trả lương.</p>' : `
              <table style="width:100%; border-collapse:collapse;">
                <thead>
                  <tr style="border-bottom:1px solid var(--hairline); text-align:left;">
                    <th style="padding:8px 0;">Tháng</th>
                    <th style="padding:8px 0; text-align:center;">Số giờ làm</th>
                    <th style="padding:8px 0; text-align:right;">Lương thực lĩnh</th>
                  </tr>
                </thead>
                <tbody>
                  ${salary.map(s => `
                    <tr style="border-bottom:1px solid rgba(0,0,0,0.04);">
                      <td style="padding:8px 0;"><strong>Tháng ${s.month}</strong></td>
                      <td style="padding:8px 0; text-align:center;">${s.total_hours.toFixed(1)} giờ</td>
                      <td style="padding:8px 0; text-align:right; color:var(--primary); font-weight:700;">${fmtCurrency(s.total_salary)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            `}
          </div>
        `,
        size: 'md'
      });
    }
  } catch (err) {
    Toast.error('Không thể lấy lịch sử lương nhân sự.');
  }
};

const deleteUser = async (id) => {
  const user = usersData.find(u => u.id == id);
  if (!user) return;

  Confirm.open({
    title: 'Xóa tài khoản',
    message: `Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản @${user.username} (${user.full_name})?`,
    onConfirm: async () => {
      try {
        const res = await api.delete(`/api/users/${id}`);
        if (res.success) {
          Toast.success('Xóa tài khoản thành công!');
          fetchUsers();
        }
      } catch (err) {
        Toast.error(err.message || 'Không thể xóa tài khoản này.');
      }
    }
  });
};

const openAddUserModal = () => {
  Modal.open({
    title: currentTab === 'nhansu' ? 'Thêm nhân viên mới' : 'Thêm tài khoản hệ thống',
    size: 'lg',
    content: `
      <form id="add-user-form" enctype="multipart/form-data">
        <div class="form-group">
          <label class="form-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Tên đăng nhập (Username)
          </label>
          <input class="form-control" type="text" id="new-user-username" placeholder="Ví dụ: hoa_nguyen" required />
        </div>
        <div class="form-group">
          <label class="form-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Họ và tên
          </label>
          <input class="form-control" type="text" id="new-user-name" placeholder="Nguyễn Thị Hoa" required />
        </div>
        <div class="form-group">
          <label class="form-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Mật khẩu
          </label>
          <input class="form-control" type="password" id="new-user-pw" required />
        </div>
        <div class="form-group">
          <label class="form-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Vai trò
          </label>
          <select class="form-control" id="new-user-role">
            <option value="staff">Nhân viên (Staff)</option>
            <option value="admin">Quản lý (Admin)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            Số điện thoại
          </label>
          <input class="form-control" type="text" id="new-user-phone" />
        </div>
        <div class="form-group">
          <label class="form-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            Lương mỗi giờ
          </label>
          <input class="form-control" type="text" id="new-user-salary" value="25000" />
        </div>
        <div class="form-group">
          <label class="form-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            Ảnh đại diện
          </label>
          <div class="image-upload-zone" id="new-user-avatar-zone" style="min-height: 100px;">
            <input type="file" id="new-user-avatar" accept="image/*" style="display:none;" />
            <div class="upload-zone-prompt" id="new-user-avatar-prompt">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <span>Kéo thả ảnh hoặc click để chọn</span>
            </div>
            <div id="new-user-avatar-preview"></div>
          </div>
        </div>
      </form>
    `,
    onConfirm: async () => {
      const username = document.getElementById('new-user-username').value.trim();
      const full_name = document.getElementById('new-user-name').value.trim();
      const password = document.getElementById('new-user-pw').value;
      const role = document.getElementById('new-user-role').value;
      const phone = document.getElementById('new-user-phone').value.trim();
      const hourly_rate = parseMoneyInput(document.getElementById('new-user-salary').value);
      const avatarFile = document.getElementById('new-user-avatar')?.files[0];

      if (!username || !full_name || !password) {
        return Toast.warning('Vui lòng điền các trường bắt buộc.');
      }

      try {
        const fd = new FormData();
        fd.append('username', username);
        fd.append('password', password);
        fd.append('full_name', full_name);
        fd.append('role', role);
        fd.append('phone', phone);
        fd.append('hourly_rate', hourly_rate);
        if (avatarFile) fd.append('avatar', avatarFile);

        const res = await api.upload('/api/users', fd);
        if (res.success) {
          Toast.success('Tạo tài khoản thành công!');
          fetchUsers();
        }
      } catch (err) {
        Toast.error(err.message || 'Tạo tài khoản thất bại.');
      }
    }
  });

  setTimeout(() => {
    const zone = document.getElementById('new-user-avatar-zone');
    const input = document.getElementById('new-user-avatar');
    const prompt = document.getElementById('new-user-avatar-prompt');
    const preview = document.getElementById('new-user-avatar-preview');

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
            preview.innerHTML = `<img src="${ev.target.result}" style="max-height: 100px; border-radius: 50%; width: 100px; height: 100px; object-fit: cover;" />`;
          }
          if (prompt) prompt.style.display = 'none';
        };
        reader.readAsDataURL(file);
      }
    }
  }, 100);

  formatMoneyInput(document.getElementById('new-user-salary'));
};

const openEditUserModal = (id) => {
  const u = usersData.find(item => item.id == id);
  if (!u) return;

  const isTaiKhoanTab = currentTab === 'taikhoan';

  Modal.open({
    title: `Cập nhật: ${u.full_name}`,
    size: 'lg',
    content: `
      <form id="edit-user-form" style="font-family:'Inter',sans-serif;" enctype="multipart/form-data">
        ${isTaiKhoanTab ? `
        <div class="form-group" style="margin-bottom:14px; padding:10px 12px; background:var(--canvas-cream); border-radius:var(--radius-md); border:1px solid var(--hairline);">
          <span style="font-size:11px; color:var(--ink-mute); font-weight:700; text-transform:uppercase;">Tên đăng nhập hiện tại</span>
          <div style="font-size:15px; font-weight:700; color:var(--primary); margin-top:4px;">@${u.username}</div>
        </div>
        ` : ''}
        <div class="form-group">
          <label class="form-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Họ và tên
          </label>
          <input class="form-control" type="text" id="edit-user-name" value="${u.full_name}" required />
        </div>
        <div class="form-group">
          <label class="form-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Đổi mật khẩu <span style="font-size:11px; color:var(--ink-mute); font-weight:400;">(bỏ trống nếu giữ nguyên)</span>
          </label>
          <input class="form-control" type="password" id="edit-user-pw" placeholder="Nhập mật khẩu mới..." />
        </div>
        <div class="form-group">
          <label class="form-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Vai trò
          </label>
          <select class="form-control" id="edit-user-role">
            <option value="staff" ${u.role === 'staff' ? 'selected' : ''}>Nhân viên (Staff)</option>
            <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Quản lý (Admin)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            Số điện thoại
          </label>
          <input class="form-control" type="text" id="edit-user-phone" value="${u.phone || ''}" />
        </div>
        ${!isTaiKhoanTab ? `
        <div class="form-group">
          <label class="form-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            Lương mỗi giờ
          </label>
          <input class="form-control" type="text" id="edit-user-salary" value="${u.hourly_rate}" />
        </div>
        ` : `<input type="hidden" id="edit-user-salary" value="${u.hourly_rate}" />`}
        <div class="form-group">
          <label class="form-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            Ảnh đại diện
          </label>
          <div class="image-upload-zone" id="edit-user-avatar-zone" style="min-height: 100px;">
            <input type="file" id="edit-user-avatar" accept="image/*" style="display:none;" />
            <div class="upload-zone-prompt" id="edit-user-avatar-prompt" style="${u.avatar_url ? 'display:none;' : ''}">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <span>Kéo thả ảnh hoặc click để chọn</span>
            </div>
            <div id="edit-user-avatar-preview">
              ${u.avatar_url ? `<img src="${u.avatar_url}" style="max-height: 100px; border-radius: 50%; width: 100px; height: 100px; object-fit: cover;" />` : ''}
            </div>
          </div>
        </div>
      </form>
    `,
    onConfirm: async () => {
      const full_name = document.getElementById('edit-user-name').value.trim();
      const password = document.getElementById('edit-user-pw').value;
      const role = document.getElementById('edit-user-role').value;
      const phone = document.getElementById('edit-user-phone').value.trim();
      const hourly_rate = parseMoneyInput(document.getElementById('edit-user-salary').value);
      const avatarFile = document.getElementById('edit-user-avatar')?.files[0];

      if (!full_name) return Toast.warning('Tên không được bỏ trống.');

      try {
        const fd = new FormData();
        fd.append('full_name', full_name);
        if (password) fd.append('password', password);
        fd.append('role', role);
        fd.append('phone', phone);
        fd.append('hourly_rate', hourly_rate);
        if (avatarFile) fd.append('avatar', avatarFile);

        const res = await api.uploadPut(`/api/users/${id}`, fd);
        if (res.success) {
          Toast.success('Cập nhật tài khoản thành công!');
          fetchUsers();
        }
      } catch (err) {
        Toast.error(err.message || 'Cập nhật tài khoản thất bại.');
      }
    }
  });

  setTimeout(() => {
    const zone = document.getElementById('edit-user-avatar-zone');
    const input = document.getElementById('edit-user-avatar');
    const prompt = document.getElementById('edit-user-avatar-prompt');
    const preview = document.getElementById('edit-user-avatar-preview');

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
            preview.innerHTML = `<img src="${ev.target.result}" style="max-height: 100px; border-radius: 50%; width: 100px; height: 100px; object-fit: cover;" />`;
          }
          if (prompt) prompt.style.display = 'none';
        };
        reader.readAsDataURL(file);
      }
    }
  }, 100);

  if (!isTaiKhoanTab) {
    formatMoneyInput(document.getElementById('edit-user-salary'));
  }
};
