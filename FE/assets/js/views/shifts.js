/**
 * shifts.js — View phân ca làm việc & Chấm công
 */
import { api } from '../api.js';
import { Toast } from '../components/toast.js';
import { Modal } from '../components/modal.js';
import { Confirm } from '../components/confirm.js';
import { Pagination } from '../components/pagination.js';

// SVG Icons
const IcoPlus    = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
const IcoSearch  = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
const IcoTrash   = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`;
const IcoLogin   = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>`;
const IcoLogout  = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`;
const IcoCal     = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
const IcoCheck   = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><polyline points="20 6 9 17 4 12"/></svg>`;

let shiftsData = [];
let filteredShifts = [];
let employeesList = [];
let currentPage = 1;
const itemsPerPage = 10;
const user = JSON.parse(localStorage.getItem('cafe_user'));

window.changeShiftPage = (page) => {
  currentPage = page;
  renderShiftsTable();
};

const fmtDate = (dStr) => {
  if (!dStr) return '';
  const date = new Date(dStr);
  if (isNaN(date.getTime())) return dStr;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
};

const fmtDateTime = (dStr) => {
  if (!dStr) return '-';
  if (/^\d{2}:\d{2}/.test(dStr) && dStr.length <= 8) return dStr.substring(0, 5);
  const date = new Date(dStr);
  if (isNaN(date.getTime())) return dStr;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const render = () => `
  <div class="page">
    <!-- Staff Check-in/out Section -->
    <div class="card-cream" id="staff-attendance-box" style="margin-bottom:8px; display:none;">
      <h3 style="margin-bottom:8px;font-size:15px;">Chấm công ca hôm nay</h3>
      <div id="attendance-status-content">Đang tải trạng thái...</div>
    </div>

    <!-- Search Bar -->
    <div class="filter-bar" style="margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; gap:10px;">
      <div class="search-input-wrap" style="flex:1; max-width:320px;">
        <span class="icon">${IcoSearch}</span>
        <input class="form-control" type="text" id="shift-search" placeholder="Tìm theo tên nhân viên..." />
      </div>
      ${user?.role === 'admin' ? `
        <button class="btn btn-primary btn-sm" id="add-shift-btn" style="height:36px; display:inline-flex; align-items:center;">
          ${IcoPlus} Phân ca
        </button>
      ` : ''}
    </div>

    <!-- Shifts Schedule List -->
    <h3 style="margin-bottom:12px;font-size:16px;font-weight:600;">Danh sách ca phân công</h3>
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Ngày</th>
            <th>Nhân viên</th>
            <th>Ca làm</th>
            <th>Thời gian ca</th>
            <th>Trạng thái ca</th>
            <th>Giờ Check-in</th>
            <th>Giờ Check-out</th>
            <th>Số giờ làm</th>
            <th>Đi muộn</th>
            ${user?.role === 'admin' ? '<th class="text-right">Hành động</th>' : ''}
          </tr>
        </thead>
        <tbody id="shifts-list">
          <tr>
            <td colspan="${user?.role === 'admin' ? 10 : 9}" class="text-center">Đang tải lịch phân ca...</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div id="shift-pagination-container"></div>
  </div>
`;

export const init = async () => {
  await fetchShifts();
  if (user?.role === 'admin') {
    await fetchEmployees();
    document.getElementById('add-shift-btn')?.addEventListener('click', openAddShiftModal);
  } else {
    await renderStaffAttendanceCard();
  }

  document.getElementById('shift-search')?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    filteredShifts = q
      ? shiftsData.filter(s => s.employee_name.toLowerCase().includes(q))
      : [...shiftsData];
    currentPage = 1;
    renderShiftsTable();
  });
};

const fetchShifts = async () => {
  try {
    const res = await api.get('/api/shifts');
    if (res.success) {
      shiftsData = res.data;
      filteredShifts = [...shiftsData];
      currentPage = 1;
      renderShiftsTable();
    }
  } catch (err) {
    Toast.error('Không thể lấy lịch phân ca.');
  }
};

const fetchEmployees = async () => {
  try {
    const res = await api.get('/api/users');
    if (res.success) {
      employeesList = res.data.filter(u => u.role === 'staff');
    }
  } catch (err) {
    console.error('Lỗi lấy danh sách nhân viên.');
  }
};

const renderShiftsTable = () => {
  const tbody = document.getElementById('shifts-list');
  if (!tbody) return;

  if (filteredShifts.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="${user?.role === 'admin' ? 10 : 9}">
          <div class="empty-state"><div class="icon">${IcoCal}</div><p>Không có lịch ca làm nào được phân công.</p></div>
        </td>
      </tr>
    `;
    document.getElementById('shift-pagination-container').innerHTML = '';
    return;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const sliced = filteredShifts.slice(startIndex, startIndex + itemsPerPage);
  const shiftNameMap = { ca_sang: 'Ca Sáng', ca_chieu: 'Ca Chiều', ca_toi: 'Ca Tối' };

  tbody.innerHTML = sliced.map(s => {
    let statusBadge = `<span class="badge badge-muted">Chờ làm</span>`;
    if (s.status === 'active') statusBadge = `<span class="badge badge-primary">Đang làm</span>`;
    else if (s.status === 'completed') statusBadge = `<span class="badge badge-success">Hoàn thành</span>`;

    const hours = s.actual_hours !== null && s.actual_hours !== undefined ? `${s.actual_hours.toFixed(2)}h` : '-';
    const late = s.late_minutes ? `${s.late_minutes} phút` : '-';

    return `
      <tr>
        <td><strong>${fmtDate(s.date)}</strong></td>
        <td>${s.employee_name}</td>
        <td>${shiftNameMap[s.name] || s.name}</td>
        <td><small>${s.start_time.substring(0, 5)} - ${s.end_time.substring(0, 5)}</small></td>
        <td>${statusBadge}</td>
        <td>${fmtDateTime(s.check_in_time)}</td>
        <td>${fmtDateTime(s.check_out_time)}</td>
        <td><strong>${hours}</strong></td>
        <td style="${s.late_minutes > 0 ? 'color:var(--error); font-weight:bold;' : ''}">${late}</td>
        ${user?.role === 'admin' ? `
          <td class="text-right">
            <button class="btn btn-ghost btn-sm delete-shift-btn" data-id="${s.id}" title="Hủy ca">
              ${IcoTrash} Hủy
            </button>
          </td>
        ` : ''}
      </tr>
    `;
  }).join('');

  const pagContainer = document.getElementById('shift-pagination-container');
  if (pagContainer) {
    pagContainer.innerHTML = Pagination.render(filteredShifts.length, currentPage, itemsPerPage, 'changeShiftPage');
  }

  tbody.querySelectorAll('.delete-shift-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const confirmed = await Confirm.ask('Bạn có chắc chắn muốn hủy phân ca này?', true);
      if (confirmed) deleteShift(btn.dataset.id);
    });
  });
};

const renderStaffAttendanceCard = async () => {
  const box = document.getElementById('staff-attendance-box');
  const content = document.getElementById('attendance-status-content');
  if (!box || !content) return;

  try {
    const res = await api.get('/api/shifts/today');
    if (res.success && res.data) {
      box.style.display = 'block';
      const shift = res.data;
      const shiftNameMap = { ca_sang: 'Ca Sáng', ca_chieu: 'Ca Chiều', ca_toi: 'Ca Tối' };

      let html = `
        <p style="margin-bottom:12px;">Bạn được phân công làm: <strong>${shiftNameMap[shift.name]}</strong> (${shift.start_time.substring(0,5)} - ${shift.end_time.substring(0,5)}) ngày hôm nay.</p>
      `;

      if (!shift.check_in_time) {
        html += `<button class="btn btn-primary" id="punch-in-btn">${IcoLogin} Điểm danh Check-in</button>`;
      } else if (shift.check_in_time && !shift.check_out_time) {
        html += `
          <div style="margin-bottom:12px; color:var(--success); font-weight:600; display:flex; align-items:center;">
            ${IcoCheck} Đã check-in lúc: ${fmtDateTime(shift.check_in_time)} (Đi muộn: ${shift.late_minutes} phút)
          </div>
          <div class="form-group" style="max-width:320px;">
            <input class="form-control" type="text" id="attendance-note" placeholder="Ghi chú bàn giao ca..." />
          </div>
          <button class="btn btn-danger" id="punch-out-btn">${IcoLogout} Điểm danh Check-out</button>
        `;
      } else {
        html += `
          <div style="color:var(--success); font-weight:600; display:flex; align-items:center;">
            ${IcoCheck} Bạn đã hoàn thành ca làm việc ngày hôm nay. (${fmtDateTime(shift.check_in_time)} - ${fmtDateTime(shift.check_out_time)})
          </div>
        `;
      }

      content.innerHTML = html;
      document.getElementById('punch-in-btn')?.addEventListener('click', () => handlePunchIn(shift.id));
      document.getElementById('punch-out-btn')?.addEventListener('click', () => handlePunchOut(shift.id));
    } else {
      box.style.display = 'block';
      content.innerHTML = `<p class="text-muted">Hôm nay bạn không có lịch phân ca làm việc.</p>`;
    }
  } catch (err) {
    console.error('Lỗi lấy ca làm việc cá nhân.');
  }
};

const handlePunchIn = async (shiftId) => {
  try {
    const res = await api.post('/api/attendances/check-in', { shift_id: shiftId });
    if (res.success) { Toast.success(res.message); fetchShifts(); renderStaffAttendanceCard(); }
  } catch (err) {
    Toast.error(err.message || 'Check-in thất bại.');
  }
};

const handlePunchOut = async (shiftId) => {
  const note = document.getElementById('attendance-note')?.value.trim();
  try {
    const res = await api.post('/api/attendances/check-out', { shift_id: shiftId, note });
    if (res.success) { Toast.success(res.message); fetchShifts(); renderStaffAttendanceCard(); }
  } catch (err) {
    Toast.error(err.message || 'Check-out thất bại.');
  }
};

const openAddShiftModal = () => {
  Modal.open({
    title: 'Phân ca làm việc mới',
    content: `
      <form id="add-shift-form">
        <div class="form-group">
          <label class="form-label">Chọn nhân viên</label>
          <select class="form-control" id="new-shift-employee">
            ${employeesList.map(e => `<option value="${e.id}">${e.full_name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Chọn ca làm</label>
          <select class="form-control" id="new-shift-name">
            <option value="ca_sang">Ca Sáng (06:00 - 14:00)</option>
            <option value="ca_chieu">Ca Chiều (14:00 - 22:00)</option>
            <option value="ca_toi">Ca Tối (22:00 - 06:00)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Chọn Ngày làm</label>
          <input class="form-control" type="text" id="new-shift-date" placeholder="dd/mm/yyyy" required />
        </div>
      </form>
    `,
    onConfirm: async () => {
      const user_id = parseInt(document.getElementById('new-shift-employee').value);
      const name = document.getElementById('new-shift-name').value;
      const dateRaw = document.getElementById('new-shift-date').value.trim();

      if (!dateRaw) return Toast.warning('Vui lòng chọn ngày làm việc.');

      const parts = dateRaw.split('/');
      if (parts.length !== 3 || parts[0].length !== 2 || parts[1].length !== 2 || parts[2].length !== 4) {
        return Toast.warning('Định dạng ngày làm việc không hợp lệ (dd/mm/yyyy).');
      }

      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);
      if (isNaN(day) || isNaN(month) || isNaN(year) || day < 1 || day > 31 || month < 1 || month > 12 || year < 2000) {
        return Toast.warning('Ngày làm việc nhập vào không hợp lệ.');
      }

      const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      let start_time = '06:00:00', end_time = '14:00:00';
      if (name === 'ca_chieu') { start_time = '14:00:00'; end_time = '22:00:00'; }
      else if (name === 'ca_toi') { start_time = '22:00:00'; end_time = '06:00:00'; }

      try {
        const res = await api.post('/api/shifts', { user_id, name, date, start_time, end_time });
        if (res.success) { Toast.success('Phân ca nhân viên thành công!'); fetchShifts(); }
      } catch (err) {
        Toast.error(err.message || 'Phân ca thất bại.');
      }
    }
  });

  const inputEl = document.getElementById('new-shift-date');
  if (inputEl) {
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
    });
  }
};

const deleteShift = async (id) => {
  try {
    const res = await api.delete(`/api/shifts/${id}`);
    if (res.success) { Toast.success('Đã hủy phân ca làm việc.'); fetchShifts(); }
  } catch (err) {
    Toast.error(err.message || 'Không thể hủy ca làm.');
  }
};
