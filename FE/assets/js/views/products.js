/**
 * products.js — View Quản lý Sản phẩm (Admin only)
 */
import { api } from '../api.js';
import { Toast } from '../components/toast.js';
import { Modal } from '../components/modal.js';
import { Pagination } from '../components/pagination.js';

// SVG Icons
const IcoSearch = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
const IcoPlus   = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
const IcoEdit   = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
const IcoTrash  = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`;
const IcoCup    = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>`;
const IcoBox    = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`;
const IcoDownload = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;

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

let products = [];
let categories = [];
let filterCategory = '';
let filterStatus = '';
let searchQuery = '';
let currentPage = 1;
const itemsPerPage = 10;

window.changeProductPage = (page) => {
  currentPage = page;
  renderTable();
};

export const render = () => `
<div class="page">
  <!-- Filter Bar -->
  <div class="filter-bar" style="margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap;">
    <div style="display:flex; gap:8px; flex:1; max-width:600px; flex-wrap:wrap;">
      <div class="search-input-wrap" style="flex:1; min-width:180px;">
        <span class="icon">${IcoSearch}</span>
        <input class="form-control" type="text" id="prod-search" placeholder="Tìm sản phẩm..." />
      </div>
      <select class="form-control" id="prod-filter-cat" style="width:150px">
        <option value="">Tất cả danh mục</option>
      </select>
      <select class="form-control" id="prod-filter-status" style="width:150px">
        <option value="">Tất cả trạng thái</option>
        <option value="true">Đang bán</option>
        <option value="false">Ngừng bán</option>
      </select>
    </div>
    <div style="display:flex; gap:8px;">
      <button class="btn btn-outline btn-sm" id="export-product-excel-btn" style="height:36px; display:inline-flex; align-items:center; gap:6px; cursor:pointer;">
        ${IcoDownload} Xuất Excel
      </button>
      <button class="btn btn-primary btn-sm" id="add-product-btn" style="height:36px; display:inline-flex; align-items:center;">
        ${IcoPlus} Thêm sản phẩm
      </button>
    </div>
  </div>

  <!-- Table -->
  <div class="table-wrapper">
    <table>
      <thead>
        <tr>
          <th>Ảnh</th>
          <th>Tên sản phẩm</th>
          <th>Danh mục</th>
          <th>Giá</th>
          <th>Trạng thái</th>
          <th style="text-align:center">Hành động</th>
        </tr>
      </thead>
      <tbody id="products-tbody">
        <tr><td colspan="6" class="text-center text-muted" style="padding:24px">Đang tải...</td></tr>
      </tbody>
    </table>
  </div>
  <div id="product-pagination-container"></div>
</div>
`;

const renderTable = () => {
  const tbody = document.getElementById('products-tbody');
  if (!tbody) return;

  const filtered = products.filter(p => {
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = !filterCategory || p.category_id == filterCategory;
    const matchStatus = filterStatus === '' || p.is_available == (filterStatus === 'true' ? 1 : 0);
    return matchSearch && matchCat && matchStatus;
  });

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="icon">${IcoBox}</div><p>Không tìm thấy sản phẩm nào</p></div></td></tr>`;
    document.getElementById('product-pagination-container').innerHTML = '';
    return;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const sliced = filtered.slice(startIndex, startIndex + itemsPerPage);

  tbody.innerHTML = sliced.map(p => `
    <tr>
      <td>
        ${p.image_url
          ? `<img src="${p.image_url}" class="product-img-sm" alt="${p.name}" />`
          : `<div class="product-img-sm" style="display:flex;align-items:center;justify-content:center;color:var(--ink-mute)">${IcoCup}</div>`}
      </td>
      <td>
        <div style="font-weight:600">${p.name}</div>
        ${p.description ? `<div class="text-muted" style="font-size:0.78rem;margin-top:2px">${p.description.substring(0,50)}${p.description.length>50?'...':''}</div>` : ''}
      </td>
      <td><span class="badge badge-brand">${p.category_name || '—'}</span></td>
      <td class="currency">${fmtCurrency(p.price)}</td>
      <td>
        <label class="toggle-switch" title="${p.is_available ? 'Đang bán' : 'Ngừng bán'}">
          <input type="checkbox" class="toggle-available" data-id="${p.id}" ${p.is_available ? 'checked' : ''} />
          <span class="toggle-thumb"></span>
        </label>
      </td>
      <td style="text-align:center">
        <div style="display:flex;gap:6px;justify-content:center">
          <button class="btn btn-secondary btn-sm edit-product-btn" data-id="${p.id}" title="Sửa">
            ${IcoEdit} Sửa
          </button>
          <button class="btn btn-danger btn-sm delete-product-btn" data-id="${p.id}" title="Xóa">
            ${IcoTrash}
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  const pagContainer = document.getElementById('product-pagination-container');
  if (pagContainer) {
    pagContainer.innerHTML = Pagination.render(filtered.length, currentPage, itemsPerPage, 'changeProductPage');
  }

  tbody.querySelectorAll('.toggle-available').forEach(cb => {
    cb.addEventListener('change', async () => {
      const res = await api.patch(`/api/products/${cb.dataset.id}/toggle`).catch(e => { Toast.error(e.message); return null; });
      if (res?.success) { Toast.success(res.message); await loadProducts(); }
    });
  });

  tbody.querySelectorAll('.edit-product-btn').forEach(btn => {
    btn.addEventListener('click', () => openProductForm(products.find(p => p.id == btn.dataset.id)));
  });

  tbody.querySelectorAll('.delete-product-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const prod = products.find(p => p.id == btn.dataset.id);
      Modal.confirm({
        title: 'Xóa sản phẩm',
        message: `Bạn có chắc muốn xóa sản phẩm <strong>${prod?.name}</strong>? Hành động này không thể hoàn tác.`,
        confirmText: 'Xóa',
        danger: true,
        onConfirm: async () => {
          const res = await api.delete(`/api/products/${btn.dataset.id}`).catch(e => { Toast.error(e.message); return null; });
          if (res?.success) { Toast.success('Đã xóa sản phẩm.'); Modal.close(); await loadProducts(); }
          else Toast.error(res?.message || 'Xóa thất bại.');
        },
      });
    });
  });
};

const openProductForm = (product = null) => {
  const isEdit = !!product;
  let previewUrl = product?.image_url || '';

  Modal.open({
    title: isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới',
    size: 'lg',
    content: `
      <form id="product-form" enctype="multipart/form-data">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-group" style="grid-column:1/-1">
            <label class="form-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>
              Tên sản phẩm *
            </label>
            <input class="form-control" id="pf-name" value="${product?.name || ''}" placeholder="Tên sản phẩm" required />
          </div>
          <div class="form-group">
            <label class="form-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
              Danh mục *
            </label>
            <select class="form-control" id="pf-category" required>
              ${categories.map(c => `<option value="${c.id}" ${product?.category_id == c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              Giá
            </label>
            <input class="form-control" id="pf-price" type="text" value="${product?.price || ''}" placeholder="0 VNĐ" required />
          </div>
          <div class="form-group" style="grid-column:1/-1">
            <label class="form-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
              Mô tả
            </label>
            <textarea class="form-control" id="pf-desc" rows="2" placeholder="Mô tả ngắn về sản phẩm">${product?.description || ''}</textarea>
          </div>
          <div class="form-group" style="grid-column:1/-1">
            <label class="form-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              Ảnh sản phẩm
            </label>
            <div class="image-upload-zone" id="pf-upload-zone">
              <input type="file" id="pf-image" accept="image/*" style="display:none;" />
              <div class="upload-zone-prompt" id="pf-upload-prompt" style="${previewUrl ? 'display:none;' : ''}">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <span>Kéo thả ảnh hoặc click để chọn</span>
              </div>
              <div id="pf-preview">
                ${previewUrl ? `<img src="${previewUrl}" class="img-preview" id="img-preview-tag" style="max-height: 140px; border-radius: 8px;" />` : ''}
              </div>
            </div>
          </div>
        </div>
      </form>
    `,
    confirmText: isEdit ? 'Cập nhật' : 'Tạo sản phẩm',
    onConfirm: async () => {
      const name = document.getElementById('pf-name')?.value.trim();
      const cat = document.getElementById('pf-category')?.value;
      const price = parseMoneyInput(document.getElementById('pf-price')?.value);
      const desc = document.getElementById('pf-desc')?.value;
      const imageFile = document.getElementById('pf-image')?.files[0];

      if (!name || !cat || !price) { Toast.warning('Vui lòng điền đầy đủ thông tin bắt buộc.'); return; }

      const fd = new FormData();
      fd.append('name', name);
      fd.append('category_id', cat);
      fd.append('price', price);
      fd.append('description', desc || '');
      if (imageFile) fd.append('image', imageFile);

      let res;
      if (isEdit) res = await api.uploadPut(`/api/products/${product.id}`, fd).catch(e => { Toast.error(e.message); return null; });
      else res = await api.upload('/api/products', fd).catch(e => { Toast.error(e.message); return null; });

      if (res?.success) {
        Toast.success(isEdit ? 'Cập nhật sản phẩm thành công!' : 'Tạo sản phẩm thành công!');
        Modal.close();
        await loadProducts();
      } else {
        Toast.error(res?.message || 'Có lỗi xảy ra.');
      }
    },
  });

  formatMoneyInput(document.getElementById('pf-price'));

  setTimeout(() => {
    const zone = document.getElementById('pf-upload-zone');
    const input = document.getElementById('pf-image');
    const prompt = document.getElementById('pf-upload-prompt');
    const preview = document.getElementById('pf-preview');

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
            preview.innerHTML = `<img src="${ev.target.result}" class="img-preview" id="img-preview-tag" style="max-height: 140px; border-radius: 8px;" />`;
          }
          if (prompt) prompt.style.display = 'none';
        };
        reader.readAsDataURL(file);
      }
    }
  }, 100);
};

const loadProducts = async () => {
  const res = await api.get('/api/products').catch(() => null);
  products = res?.data || [];
  currentPage = 1;
  renderTable();
};

export const init = async () => {
  const catRes = await api.get('/api/categories').catch(() => ({ data: [] }));
  categories = catRes?.data || [];

  const catFilter = document.getElementById('prod-filter-cat');
  if (catFilter) {
    catFilter.innerHTML = `<option value="">Tất cả danh mục</option>` +
      categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    catFilter.addEventListener('change', (e) => { filterCategory = e.target.value; currentPage = 1; renderTable(); });
  }

  document.getElementById('prod-search')?.addEventListener('input', (e) => { searchQuery = e.target.value; currentPage = 1; renderTable(); });
  document.getElementById('prod-filter-status')?.addEventListener('change', (e) => { filterStatus = e.target.value; currentPage = 1; renderTable(); });
  document.getElementById('add-product-btn')?.addEventListener('click', () => openProductForm());
  document.getElementById('export-product-excel-btn')?.addEventListener('click', () => {
    const token = localStorage.getItem('cafe_token');
    window.open(`/api/reports/export/excel?tab=products&token=${token}`, '_blank');
  });

  await loadProducts();
};
