/**
 * pos.js — View POS Bán hàng
 */
import { api } from '../api.js';
import { Toast } from '../components/toast.js';
import { Modal } from '../components/modal.js';

// SVG Icons for professional layout
const IconSearch = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;
const IconCart = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>`;
const IconPin = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
const IconUser = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
const IconVoucher = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="15" y1="5" x2="15" y2="19"></line><path d="M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7a2 2 0 0 1 2-2z"></path></svg>`;
const IconTrash = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
const IconPlus = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
const IconCash = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>`;
const IconQR = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"></rect><line x1="12" y1="18" x2="12" y2="18"></line></svg>`;
const IconCup = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="2" x2="6" y2="4"></line><line x1="10" y1="2" x2="10" y2="4"></line><line x1="14" y1="2" x2="14" y2="4"></line></svg>`;
const IconWarn = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
const IconPrinter = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>`;
const IconLink = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`;
const IconLoader = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
const IconGift = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>`;

const fmtCurrency = (n) => new Intl.NumberFormat('vi-VN').format(n || 0) + ' VNĐ';

let cart = [];          // { product, quantity, note }
let categories = [];
let products = [];
let tables = [];
let selectedCategory = 'all';
let searchQuery = '';
let customer = null;    // { id, full_name, phone } hoặc null
let appliedVoucher = null; // { voucher, discount }
let selectedTableId = '';
let debounceTimer = null;
let pollingTimer = null;
let countdownTimer = null;

const getTotal = () => {
  const subtotal = cart.reduce((s, i) => s + (i.price || i.product.price) * i.quantity, 0);
  const discount_loyalty = customer ? Math.round(subtotal * 0.1) : 0;
  const subtotal_after_loyalty = subtotal - discount_loyalty;

  let discount_voucher = 0;
  if (appliedVoucher) {
    const { voucher } = appliedVoucher;
    if (voucher.type === 'percent') {
      discount_voucher = (voucher.value / 100) * subtotal_after_loyalty;
      if (voucher.max_discount_amount) {
        discount_voucher = Math.min(discount_voucher, voucher.max_discount_amount);
      }
    } else {
      discount_voucher = voucher.value;
    }
    discount_voucher = Math.round(discount_voucher);
  }

  const discount_total = discount_loyalty + discount_voucher;
  return {
    subtotal,
    discount_loyalty,
    discount_voucher,
    discount_total,
    total: Math.max(0, subtotal - discount_total)
  };
};

const renderProductGrid = () => {
  const filtered = products.filter(p => {
    const matchCat = selectedCategory === 'all' || p.category_id == selectedCategory;
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch && !p.is_deleted;
  });

  if (!filtered.length) {
    return `<div class="cart-empty"><div class="icon">${IconSearch}</div><p>Không tìm thấy sản phẩm</p></div>`;
  }

  return filtered.map(p => `
    <div class="pos-product-card${!p.is_available ? ' unavailable' : ''}"
         data-product-id="${p.id}" title="${p.name}">
      <div class="pos-product-img">
        ${p.image_url
      ? `<img src="${p.image_url}" alt="${p.name}" loading="lazy" />`
      : `<div class="pos-cup-icon">${IconCup}</div>`}
      </div>
      <div class="pos-product-info">
        <div class="pos-product-name">${p.name}</div>
      </div>
    </div>
  `).join('');
};

const renderCart = () => {
  const cartEl = document.getElementById('pos-cart-items');
  const countBadge = document.getElementById('cart-count-badge');
  const totalQty = cart.reduce((s, i) => s + i.quantity, 0);
  if (countBadge) countBadge.textContent = totalQty;

  if (!cartEl) return;

  if (!cart.length) {
    cartEl.innerHTML = `
      <div class="cart-empty">
        <div class="icon">${IconCart}</div>
        <p>Giỏ hàng trống<br/><small>Chọn sản phẩm bên trái để thêm</small></p>
      </div>`;
    renderSummary();
    return;
  }

  cartEl.innerHTML = cart.map((item, idx) => `
    <div class="cart-item" data-idx="${idx}">
      <div style="flex: 1;">
        <div class="cart-item-name" style="display:flex; align-items:center; flex-wrap:wrap; gap:4px;">
          ${item.product.name}
          <span style="font-size:10px; font-weight:700; color:var(--primary); background:var(--canvas-lavender); padding:2px 6px; border-radius:4px;">Size ${item.size || 'M'}</span>
        </div>
        <div class="cart-item-price">${fmtCurrency(item.price || item.product.price)}</div>
        <input 
          type="text" 
          class="cart-item-note-input" 
          placeholder="Ghi chú (ít đá, ít đường...)" 
          value="${item.note || ''}" 
          data-idx="${idx}"
          style="width: 100%; border: none; border-bottom: 1px dashed var(--hairline); font-size: 12px; padding: 4px 0; outline: none; margin-top: 4px; color: var(--ink-mute);"
        />
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn minus" data-idx="${idx}">−</button>
        <span class="qty-value">${item.quantity}</span>
        <button class="qty-btn plus" data-idx="${idx}">+</button>
        <span class="cart-item-subtotal">${fmtCurrency((item.price || item.product.price) * item.quantity)}</span>
        <button class="cart-item-delete" data-idx="${idx}" title="Xóa">${IconTrash}</button>
      </div>
    </div>
  `).join('');

  // Events
  cartEl.querySelectorAll('.qty-btn.plus').forEach(btn => {
    btn.addEventListener('click', () => { cart[btn.dataset.idx].quantity++; renderCart(); });
  });
  cartEl.querySelectorAll('.qty-btn.minus').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = +btn.dataset.idx;
      cart[idx].quantity--;
      if (cart[idx].quantity <= 0) cart.splice(idx, 1);
      renderCart();
    });
  });
  cartEl.querySelectorAll('.cart-item-delete').forEach(btn => {
    btn.addEventListener('click', () => { cart.splice(+btn.dataset.idx, 1); renderCart(); });
  });
  cartEl.querySelectorAll('.cart-item-note-input').forEach(input => {
    input.addEventListener('input', (e) => {
      cart[input.dataset.idx].note = e.target.value;
    });
  });

  renderSummary();
};

const renderSummary = () => {
  const { subtotal, discount_loyalty, discount_voucher, total } = getTotal();
  const summaryEl = document.getElementById('pos-summary');
  if (!summaryEl) return;

  summaryEl.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; padding-bottom:6px; border-bottom:1px dashed #cbd5e1;">
      <span style="font-size:13px; color:var(--ink-mute); font-weight:600; display:flex; align-items:center; gap:6px;">
        Ưu đãi & Khách hàng
      </span>
      <button class="btn btn-secondary btn-sm" id="open-discount-modal-btn" style="padding:0; border-radius:50%; width:30px; height:30px; display:inline-flex; align-items:center; justify-content:center; background:var(--canvas-lavender); border-color:var(--primary-light); color:var(--primary);" title="Chọn mã giảm giá / Khách hàng">
        ${IconGift}
      </button>
    </div>
    <div class="summary-row">
      <span>Tạm tính</span>
      <span>${fmtCurrency(subtotal)}</span>
    </div>
    ${discount_loyalty ? `
    <div class="summary-row summary-discount">
      <span style="display:inline-flex;align-items:center;">${IconGift} KH thân thiết (−10%)</span>
      <span>−${fmtCurrency(discount_loyalty)}</span>
    </div>` : ''}
    ${discount_voucher ? `
    <div class="summary-row summary-discount">
      <span style="display:inline-flex;align-items:center;">${IconVoucher} Mã giảm giá</span>
      <span>−${fmtCurrency(discount_voucher)}</span>
    </div>` : ''}
    <div class="summary-row total">
      <span>TỔNG CỘNG</span>
      <span class="amount">${fmtCurrency(total)}</span>
    </div>
  `;
};

const openProductOptionsModal = (productId) => {
  const product = products.find(p => p.id == productId);
  if (!product || !product.is_available) return;

  let qty = 1;
  let size = 'M';
  const getPrice = () => size === 'L' ? product.price + 10000 : product.price;

  Modal.open({
    title: product.name,
    content: `
      <div style="font-family:'Inter',sans-serif; display:flex; gap:16px;">
        <div style="width:130px; height:130px; border-radius:12px; overflow:hidden; background:var(--canvas-cream); display:flex; align-items:center; justify-content:center; border:1.5px solid #cbd5e1; flex-shrink:0;">
          ${product.image_url 
            ? `<img src="${product.image_url}" style="width:100%; height:100%; object-fit:cover;" />` 
            : `<div style="font-size:32px; color:var(--primary);">${IconCup}</div>`}
        </div>
        <div style="flex:1;">
          <h4 style="margin:0 0 6px 0; font-size:16px; font-weight:700;">${product.name}</h4>
          <p style="margin:0 0 12px 0; font-size:13px; color:var(--ink-mute);">${product.description || 'Không có mô tả cho món này.'}</p>
          
          <!-- Size selection -->
          <div class="form-group" style="margin-bottom:12px;">
            <label class="form-label" style="font-size:11px; margin-bottom:4px;">Chọn kích thước (Size)</label>
            <div style="display:flex; gap:10px; margin-top:4px;">
              <label style="flex:1; display:flex; align-items:center; gap:8px; border:1.5px solid var(--primary); background:var(--primary-lighter); padding:8px 12px; border-radius:8px; cursor:pointer;" id="modal-size-m-label">
                <input type="radio" name="modal-size" value="M" checked style="accent-color:var(--primary);" />
                <div style="text-align:left;">
                  <div style="font-weight:700; font-size:13px; color:var(--primary);">Size M</div>
                  <div style="font-size:11px; color:var(--ink-mute);">${fmtCurrency(product.price)}</div>
                </div>
              </label>
              <label style="flex:1; display:flex; align-items:center; gap:8px; border:1.5px solid #cbd5e1; padding:8px 12px; border-radius:8px; cursor:pointer;" id="modal-size-l-label">
                <input type="radio" name="modal-size" value="L" style="accent-color:var(--primary);" />
                <div style="text-align:left;">
                  <div style="font-weight:700; font-size:13px;">Size L</div>
                  <div style="font-size:11px; color:var(--ink-mute);">${fmtCurrency(product.price + 10000)}</div>
                </div>
              </label>
            </div>
          </div>
          
          <!-- Quantity selector -->
          <div class="form-group" style="margin-bottom:12px; display:flex; align-items:center; justify-content:space-between; border-top:1px solid var(--hairline); padding-top:12px;">
            <label class="form-label" style="font-size:11px; margin:0;">Số lượng</label>
            <div style="display:flex; align-items:center; gap:10px;">
              <button class="qty-btn" id="modal-qty-minus" type="button" style="width:30px; height:30px; border-radius:50%; border:1px solid var(--hairline); background:var(--canvas-cream); cursor:pointer;">−</button>
              <span id="modal-qty-value" style="font-weight:700; font-size:16px; min-width:24px; text-align:center;">1</span>
              <button class="qty-btn" id="modal-qty-plus" type="button" style="width:30px; height:30px; border-radius:50%; border:1px solid var(--hairline); background:var(--canvas-cream); cursor:pointer;">+</button>
            </div>
          </div>

          <!-- Note input -->
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label" style="font-size:11px; margin-bottom:4px;">Ghi chú món</label>
            <input type="text" class="form-control" id="modal-note-input" placeholder="Ví dụ: Ít đá, nhiều đường..." style="font-size:13px; min-height:36px; padding:6px 12px; border-radius:var(--radius-md);" />
          </div>
        </div>
      </div>
    `,
    confirmText: 'Thêm vào giỏ',
    onConfirm: () => {
      const note = document.getElementById('modal-note-input')?.value.trim() || '';
      const finalPrice = getPrice();
      addToCartWithOptions(product, qty, size, finalPrice, note);
      Modal.close();
    }
  });

  // Attach modal listeners
  setTimeout(() => {
    const sizeM = document.querySelector('input[name="modal-size"][value="M"]');
    const sizeL = document.querySelector('input[name="modal-size"][value="L"]');
    const sizeMLabel = document.getElementById('modal-size-m-label');
    const sizeLLabel = document.getElementById('modal-size-l-label');
    const qtyVal = document.getElementById('modal-qty-value');
    const qtyMinus = document.getElementById('modal-qty-minus');
    const qtyPlus = document.getElementById('modal-qty-plus');

    sizeM?.addEventListener('change', () => {
      size = 'M';
      if (sizeMLabel) {
        sizeMLabel.style.borderColor = 'var(--primary)';
        sizeMLabel.style.background = 'var(--primary-lighter)';
      }
      if (sizeLLabel) {
        sizeLLabel.style.borderColor = '#cbd5e1';
        sizeLLabel.style.background = 'transparent';
      }
    });

    sizeL?.addEventListener('change', () => {
      size = 'L';
      if (sizeLLabel) {
        sizeLLabel.style.borderColor = 'var(--primary)';
        sizeLLabel.style.background = 'var(--primary-lighter)';
      }
      if (sizeMLabel) {
        sizeMLabel.style.borderColor = '#cbd5e1';
        sizeMLabel.style.background = 'transparent';
      }
    });

    qtyMinus?.addEventListener('click', () => {
      if (qty > 1) {
        qty--;
        if (qtyVal) qtyVal.textContent = qty;
      }
    });

    qtyPlus?.addEventListener('click', () => {
      qty++;
      if (qtyVal) qtyVal.textContent = qty;
    });
  }, 100);
};

const addToCartWithOptions = (product, quantity, size, price, note) => {
  const existing = cart.find(i => i.product.id === product.id && i.size === size && i.note === note);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ product, quantity, size, price, note });
  }
  renderCart();
};

const addToCart = (productId) => {
  openProductOptionsModal(productId);
};

const resetCart = () => {
  cart = [];
  customer = null;
  appliedVoucher = null;
  selectedTableId = '';
  const phoneInput = document.getElementById('customer-phone-input');
  if (phoneInput) phoneInput.value = '';
  const badge = document.getElementById('customer-found-badge');
  if (badge) badge.innerHTML = '';
  const voucherInput = document.getElementById('voucher-code-input');
  if (voucherInput) voucherInput.value = '';
  const vBadge = document.getElementById('voucher-applied-badge');
  if (vBadge) vBadge.innerHTML = '';
  const tableSelect = document.getElementById('pos-table-select');
  if (tableSelect) tableSelect.value = '';
  renderCart();
};

const submitOrder = async (paymentMethod) => {
  if (!cart.length) { Toast.warning('Vui lòng thêm sản phẩm vào giỏ hàng.'); return null; }
  const { subtotal, discount_loyalty } = getTotal();

  const res = await api.post('/api/orders', {
    customer_id: customer?.id || null,
    table_id: selectedTableId ? parseInt(selectedTableId) : null,
    voucher_code: appliedVoucher ? appliedVoucher.voucher.code : null,
    items: cart.map(i => ({
      product_id: i.product.id,
      quantity: i.quantity,
      size: i.size || 'M',
      note: i.note || null
    })),
    payment_method: paymentMethod,
  });
  return res;
};

const handlePayCash = async () => {
  const orderRes = await submitOrder('cash').catch(e => { Toast.error(e.message); return null; });
  if (!orderRes?.success) { Toast.error(orderRes?.message || 'Tạo đơn thất bại.'); return; }

  const orderId = orderRes.data.id;
  const payRes = await api.post(`/api/orders/${orderId}/pay-cash`).catch(e => { Toast.error(e.message); return null; });
  if (!payRes?.success) { Toast.error(payRes?.message || 'Thanh toán thất bại.'); return; }

  Toast.success('Thanh toán tiền mặt thành công!');
  resetCart();

  Modal.open({
    title: 'Thanh toán thành công',
    content: `
      <p style="color:var(--text-secondary);margin-bottom:16px">
        Đơn hàng <strong>${orderRes.data.order_code}</strong> đã được thanh toán tiền mặt.
      </p>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-secondary btn-sm" onclick="Modal.close()">Đóng</button>
        <button class="btn btn-primary btn-sm" id="print-receipt-btn" style="display:inline-flex;align-items:center;">${IconPrinter} In hóa đơn</button>
      </div>
    `,
    hideFooter: true,
  });
  document.getElementById('print-receipt-btn')?.addEventListener('click', () => {
    const token = localStorage.getItem('cafe_token');
    window.open(`/api/invoices/${orderId}/print?token=${token}`, '_blank');
    Modal.close();
  });
};

const handlePayQR = async () => {
  const orderRes = await submitOrder('qr').catch(e => { Toast.error(e.message); return null; });
  if (!orderRes?.success) { Toast.error(orderRes?.message || 'Tạo đơn thất bại.'); return; }

  const orderId = orderRes.data.id;
  const qrRes = await api.post(`/api/orders/${orderId}/pay-qr`).catch(e => { Toast.error(e.message); return null; });
  if (!qrRes?.success) { Toast.error(qrRes?.message || 'Không thể tạo link QR.'); return; }

  const { checkoutUrl } = qrRes.data;
  const { total } = getTotal();
  let isPaidSuccess = false;
  let countdownSeconds = 300; // 5 minutes

  Modal.open({
    title: 'Thanh toán QR PayOS',
    hideFooter: true,
    content: `
      <div class="qr-modal-body" style="text-align: center; padding: 12px 0; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <div id="payos-countdown" style="font-size: 14px; font-weight: 700; color: var(--error); margin-bottom: 8px;">
          Thời gian thanh toán còn lại: <span id="payos-countdown-timer">05:00</span>
        </div>
        <div class="qr-amount" style="font-size: 28px; font-weight: 850; color: var(--primary); margin-bottom: 8px;">${fmtCurrency(total)}</div>
        <p style="color:var(--ink-mute);font-size:0.875rem;margin-bottom:16px">
          Đơn hàng: <strong>${orderRes.data.order_code}</strong>
        </p>
        <div style="background: #ffffff; padding: 12px; border-radius: var(--radius-lg); box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); margin-bottom: 16px; border: 1px solid var(--hairline);">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(checkoutUrl)}" alt="PayOS QR Code" style="display: block; width: 200px; height: 200px;" />
        </div>
        <p style="color:var(--ink-mute);font-size:0.8rem;margin-bottom:16px; max-width: 280px; line-height: 1.4;">
          Quét mã QR bằng ứng dụng Ngân hàng hoặc Ví điện tử của bạn để thanh toán.
        </p>
        <a href="${checkoutUrl}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm" style="margin-bottom:12px;display:inline-flex;align-items:center;justify-content:center;gap:6px;width:auto;">
          ${IconLink} Mở cổng thanh toán Web
        </a>
        <div class="qr-status pending" id="qr-status-badge" style="background:var(--canvas-lavender); padding:10px; border-radius:var(--radius-md); font-weight:600; color:var(--primary); margin-top:8px;display:inline-flex;align-items:center;justify-content:center;width:100%;gap:6px;">
          ${IconLoader} Đang chờ quét mã thanh toán...
        </div>
        <button class="btn btn-ghost btn-sm btn-full" style="margin-top:16px" id="qr-cancel-btn">
          Hủy giao dịch
        </button>
      </div>
    `,
    onClose: async () => {
      clearInterval(pollingTimer);
      clearInterval(countdownTimer);
      if (!isPaidSuccess) {
        await api.delete(`/api/orders/${orderId}`).catch(() => {});
        Toast.warning('Đơn hàng đã được hủy bỏ.');
      }
    }
  });

  document.getElementById('qr-cancel-btn')?.addEventListener('click', () => {
    Modal.close();
  });

  // Countdown timer chạy mỗi giây
  countdownTimer = setInterval(() => {
    countdownSeconds--;
    const min = String(Math.floor(countdownSeconds / 60)).padStart(2, '0');
    const sec = String(countdownSeconds % 60).padStart(2, '0');
    const timerEl = document.getElementById('payos-countdown-timer');
    if (timerEl) {
      timerEl.textContent = `${min}:${sec}`;
    }
    if (countdownSeconds <= 0) {
      clearInterval(countdownTimer);
      clearInterval(pollingTimer);
      Modal.close();
      Toast.error('Hết thời gian thanh toán (5 phút). Đơn hàng đã bị hủy.');
    }
  }, 1000);

  // Polling mỗi 3 giây
  pollingTimer = setInterval(async () => {
    const statusRes = await api.get(`/api/orders/${orderId}`).catch(() => null);
    if (!statusRes?.success) return;

    if (statusRes.data.payment_status === 'paid') {
      isPaidSuccess = true;
      clearInterval(pollingTimer);
      clearInterval(countdownTimer);
      const badge = document.getElementById('qr-status-badge');
      if (badge) {
        badge.style.background = 'rgba(0,122,90,0.1)';
        badge.style.color = 'var(--success)';
        badge.textContent = 'Thanh toán thành công!';
      }
      Toast.success('Thanh toán QR thành công!');
      setTimeout(() => {
        Modal.close();
        resetCart();
      }, 1500);
    }
  }, 3000);
};

const openDiscountModal = () => {
  Modal.open({
    title: 'Ưu đãi & Khách hàng',
    content: `
      <div style="padding: 4px 0; font-family:'Inter',sans-serif; position:relative;">
        <!-- Customer Phone Lookup -->
        <div class="form-group" style="margin-bottom: 16px; position:relative;">
          <label class="form-label" style="font-size:11px; font-weight:700; color:var(--ink-mute); text-transform:uppercase; margin-bottom:6px; display:block;">Số điện thoại khách hàng</label>
          <div style="display:flex; gap:8px;">
            <input class="form-control" type="tel" id="modal-cust-phone" placeholder="Nhập SĐT tìm..." style="flex:1; min-height:38px; height:38px; padding:6px 12px; font-size:14px; border-radius:var(--radius-md);" value="${customer ? customer.phone : ''}" autocomplete="off" />
            <button class="btn btn-secondary btn-sm" id="modal-cust-search-btn" style="height:38px; padding:0 12px; font-size:13px; font-weight:700;">Tìm kiếm</button>
          </div>
          <!-- Dropdown Gợi ý Autocomplete -->
          <div id="modal-cust-autocomplete" style="display:none; position:absolute; left:0; right:0; top:66px; background:#fff; border:1px solid var(--hairline); border-radius:var(--radius-md); box-shadow:var(--shadow-float); z-index:1000; max-height:180px; overflow-y:auto; padding:4px 0;"></div>
          <div id="modal-cust-badge" style="margin-top:8px;"></div>
        </div>

        <!-- Vouchers List Selection -->
        <div style="border-top: 1px solid var(--hairline); padding-top: 12px;">
          <label class="form-label" style="font-size:11px; font-weight:700; color:var(--ink-mute); text-transform:uppercase; margin-bottom:8px; display:block;">Chọn mã khuyến mãi (Voucher)</label>
          <div id="modal-vouchers-list" style="max-height: 240px; overflow-y: auto; display:flex; flex-direction:column; gap:8px; padding-right:4px;">
            Đang tải danh sách voucher...
          </div>
        </div>
      </div>
    `,
    hideFooter: true,
  });

  loadModalVouchers();
  renderModalCustBadge();

  const phoneInput = document.getElementById('modal-cust-phone');
  const autocompleteContainer = document.getElementById('modal-cust-autocomplete');
  let lookupDebounce = null;

  phoneInput?.addEventListener('input', (e) => {
    const q = e.target.value.trim();
    clearTimeout(lookupDebounce);
    if (!q || q.length < 2) {
      if (autocompleteContainer) autocompleteContainer.style.display = 'none';
      return;
    }

    lookupDebounce = setTimeout(async () => {
      // Vì getAll có search param dùng được cho cả SĐT và tên nên ta dùng API này để autocomplete
      const res = await api.get(`/api/customers?search=${encodeURIComponent(q)}`).catch(() => null);
      if (res?.success && res.data && res.data.length > 0) {
        if (autocompleteContainer) {
          autocompleteContainer.style.display = 'block';
          autocompleteContainer.innerHTML = res.data.map(c => `
            <div class="autocomplete-item" data-id="${c.id}" data-phone="${c.phone}" data-name="${c.full_name}" style="padding:8px 12px; cursor:pointer; font-size:13.5px; border-bottom:1px solid rgba(0,0,0,0.02); display:flex; justify-content:space-between; align-items:center;">
              <strong>${c.phone}</strong>
              <span style="color:var(--ink-mute); font-size:12px;">${c.full_name}</span>
            </div>
          `).join('');

          // Bind click events cho items
          autocompleteContainer.querySelectorAll('.autocomplete-item').forEach(item => {
            item.addEventListener('click', () => {
              customer = {
                id: parseInt(item.dataset.id),
                phone: item.dataset.phone,
                full_name: item.dataset.name
              };
              phoneInput.value = customer.phone;
              autocompleteContainer.style.display = 'none';
              renderModalCustBadge();
              Toast.info(`Đã chọn: ${customer.full_name}`);
              recalculateDiscount();
              loadModalVouchers();
            });
          });
        }
      } else {
        if (autocompleteContainer) {
          autocompleteContainer.innerHTML = '<div style="padding:8px 12px; font-size:12.5px; color:var(--ink-mute); text-align:center;">Không tìm thấy kết quả</div>';
          autocompleteContainer.style.display = 'block';
        }
      }
    }, 250);
  });

  // Ẩn dropdown khi click ra ngoài
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#modal-cust-phone') && !e.target.closest('#modal-cust-autocomplete')) {
      if (autocompleteContainer) autocompleteContainer.style.display = 'none';
    }
  });

  document.getElementById('modal-cust-search-btn')?.addEventListener('click', handleModalCustLookup);
  document.getElementById('modal-cust-phone')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleModalCustLookup();
  });
};

const renderModalCustBadge = () => {
  const badge = document.getElementById('modal-cust-badge');
  if (!badge) return;
  if (customer) {
    badge.innerHTML = `
      <div class="customer-found-badge" style="background:var(--canvas-lavender); padding:6px 12px; border-radius:var(--radius-pill); font-size:13px; display:inline-flex; align-items:center; gap:8px; border:1.5px solid var(--primary-light);">
        ${IconUser} <strong>${customer.full_name}</strong> (${customer.phone})
        <span style="background:var(--primary); color:#fff; font-size:10px; font-weight:700; padding:2px 6px; border-radius:var(--radius-pill);">-10% Loyalty</span>
        <button class="btn btn-ghost btn-sm" id="modal-remove-cust-btn" style="padding:2px; min-height:auto; width:20px; height:20px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; margin-left:6px; color:var(--error);" title="Bỏ chọn">✕</button>
      </div>
    `;
    document.getElementById('modal-remove-cust-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      customer = null;
      document.getElementById('modal-cust-badge').innerHTML = '';
      const input = document.getElementById('modal-cust-phone');
      if (input) input.value = '';
      recalculateDiscount();
      loadModalVouchers();
    });
  } else {
    badge.innerHTML = '';
  }
};

const handleModalCustLookup = async () => {
  const phone = document.getElementById('modal-cust-phone')?.value.trim();
  if (!phone || phone.length < 9) {
    customer = null;
    renderModalCustBadge();
    recalculateDiscount();
    loadModalVouchers();
    return;
  }

  const res = await api.get(`/api/customers/lookup/${phone}`).catch(() => null);
  const badge = document.getElementById('modal-cust-badge');
  if (!badge) return;

  if (res?.success && res.data) {
    customer = res.data;
    renderModalCustBadge();
    Toast.info(`Tìm thấy: ${customer.full_name} – Áp dụng loyalty giảm 10%`);
    recalculateDiscount();
    loadModalVouchers();
  } else {
    customer = null;
    badge.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-top:4px;">
        <span style="color:var(--ink-mute);font-size:12px">Không tìm thấy khách hàng</span>
        <button class="btn btn-secondary btn-sm" id="modal-create-customer-btn" style="height:28px; padding:0 8px; font-size:11px;">${IconPlus} Tạo mới</button>
      </div>
    `;
    document.getElementById('modal-create-customer-btn')?.addEventListener('click', () => {
      Modal.open({
        title: 'Thêm khách hàng mới',
        content: `
          <div class="form-group" style="font-family:'Inter',sans-serif;">
            <label class="form-label" style="font-size:11px;">Số điện thoại</label>
            <input class="form-control" id="new-cust-phone" value="${phone}" placeholder="SĐT" style="min-height:38px; padding:6px 12px; font-size:14px;" />
          </div>
          <div class="form-group" style="font-family:'Inter',sans-serif;">
            <label class="form-label" style="font-size:11px;">Họ và tên</label>
            <input class="form-control" id="new-cust-name" placeholder="Tên khách hàng" style="min-height:38px; padding:6px 12px; font-size:14px;" />
          </div>
        `,
        confirmText: 'Tạo khách hàng',
        onConfirm: async () => {
          const p = document.getElementById('new-cust-phone')?.value;
          const n = document.getElementById('new-cust-name')?.value;
          const createRes = await api.post('/api/customers', { phone: p, full_name: n }).catch(e => { Toast.error(e.message); return null; });
          if (createRes?.success) {
            customer = createRes.data;
            Toast.success('Tạo khách hàng thành công!');
            recalculateDiscount();
            Modal.close(); // Close create modal
            openDiscountModal(); // Reopen main discount modal
          } else {
            Toast.error(createRes?.message || 'Tạo khách hàng thất bại.');
          }
        }
      });
    });
    recalculateDiscount();
    loadModalVouchers();
  }
};

const loadModalVouchers = async () => {
  const listEl = document.getElementById('modal-vouchers-list');
  if (!listEl) return;

  try {
    const res = await api.get('/api/vouchers');
    if (res.success && res.data) {
      const { subtotal, discount_loyalty } = getTotal();
      const amountToValidate = subtotal - discount_loyalty;

      const activeVouchers = res.data.filter(v => {
        const now = new Date();
        const start = v.start_date ? new Date(v.start_date) : null;
        const end = v.end_date ? new Date(v.end_date) : null;
        const isStarted = !start || now >= start;
        const isEnded = end && now > end;
        const limitReached = v.max_uses && v.used_count >= v.max_uses;
        return v.is_active && isStarted && !isEnded && !limitReached;
      });

      if (!activeVouchers.length) {
        listEl.innerHTML = '<span style="color:var(--ink-mute); font-size:13px; text-align:center; padding:12px 0;">Không có mã khuyến mãi khả dụng</span>';
        return;
      }

      listEl.innerHTML = activeVouchers.map(v => {
        const isSelected = appliedVoucher && appliedVoucher.voucher.id === v.id;
        const discountText = v.type === 'percent' ? `${v.value}%` : fmtCurrency(v.value);
        const minOrderText = v.min_order_value ? `Đơn tối thiểu: ${fmtCurrency(v.min_order_value)}` : 'Không yêu cầu đơn tối thiểu';
        const isMinOrderSatisfied = amountToValidate >= (v.min_order_value || 0);

        return `
          <div class="modal-voucher-item ${isSelected ? 'selected' : ''} ${!isMinOrderSatisfied ? 'disabled' : ''}" 
               data-code="${v.code}" 
               data-satisfied="${isMinOrderSatisfied}"
               style="border:1.5px solid ${isSelected ? 'var(--primary)' : '#cbd5e1'}; 
                      border-radius:8px; padding:10px 12px; display:flex; align-items:center; 
                      justify-content:space-between; cursor:${isMinOrderSatisfied ? 'pointer' : 'not-allowed'}; 
                      background:${isSelected ? 'var(--primary-lighter)' : 'var(--canvas)'}; 
                      opacity:${isMinOrderSatisfied ? '1' : '0.65'}; transition:all 0.15s ease;">
            <div style="text-align: left;">
              <div style="font-weight:700; color:${isSelected ? 'var(--primary)' : 'var(--ink)'}; font-size:14px; display:flex; align-items:center; gap:6px;">
                ${IconVoucher} ${v.code}
              </div>
              <div style="font-size:12px; color:var(--ink-mute); margin-top:2px;">Giảm ${discountText} — ${minOrderText}</div>
              ${v.description ? `<div style="font-size:11px; color:var(--ink-mute); margin-top:1px;">${v.description}</div>` : ''}
              ${!isMinOrderSatisfied ? `<div style="font-size:11px; color:var(--error); font-weight:600; margin-top:2px;">Chưa đủ điều kiện đơn tối thiểu</div>` : ''}
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              ${isSelected ? `<button class="btn btn-ghost btn-sm modal-remove-voucher-btn" style="padding:2px; min-height:auto; width:20px; height:20px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; color:var(--error);" title="Bỏ chọn">✕</button>` : ''}
              <input type="radio" name="modal-voucher-radio" value="${v.code}" ${isSelected ? 'checked' : ''} ${isMinOrderSatisfied ? '' : 'disabled'} style="cursor:${isMinOrderSatisfied ? 'pointer' : 'not-allowed'};" />
            </div>
          </div>
        `;
      }).join('');

      listEl.querySelectorAll('.modal-voucher-item').forEach(item => {
        const removeBtn = item.querySelector('.modal-remove-voucher-btn');
        if (removeBtn) {
          removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            appliedVoucher = null;
            Toast.info('Bỏ áp dụng mã giảm giá');
            recalculateDiscount();
            loadModalVouchers();
          });
          return;
        }

        item.addEventListener('click', async () => {
          if (item.dataset.satisfied !== 'true') return;
          const code = item.dataset.code;

          const valRes = await api.get(`/api/vouchers/validate/${code}?amount=${amountToValidate}`).catch(() => null);
          if (valRes?.success && valRes.data) {
            appliedVoucher = valRes.data;
            Toast.success('Áp dụng mã giảm giá thành công!');
          } else {
            appliedVoucher = null;
            Toast.error(valRes?.message || 'Mã không hợp lệ');
          }
          recalculateDiscount();
          loadModalVouchers();
        });
      });

    } else {
      listEl.innerHTML = '<span style="color:var(--error); font-size:13px;">Lỗi tải mã khuyến mãi</span>';
    }
  } catch (err) {
    listEl.innerHTML = '<span style="color:var(--error); font-size:13px;">Lỗi tải mã khuyến mãi</span>';
  }
};

const recalculateDiscount = () => {
  renderCart();
  renderSummary();
};

export const render = () => `
<div class="pos-layout">
  <!-- Left: Products -->
  <div class="pos-products">
    <div class="pos-products-header">
      <div class="pos-search">
        <span class="search-icon">${IconSearch}</span>
        <input type="text" id="pos-search" placeholder="Tìm sản phẩm..." autocomplete="off" />
      </div>
      <div class="pos-tabs" id="pos-tabs">
        <button class="pos-tab active" data-cat="all">Tất cả</button>
      </div>
    </div>
    <div class="pos-grid" id="pos-product-grid">
      <div class="cart-empty"><div class="icon">${IconSearch}</div><p>Đang tải...</p></div>
    </div>
  </div>

  <!-- Right: Cart -->
  <div class="pos-cart">
    <div class="pos-cart-header" style="display:flex; justify-content:space-between; align-items:center; padding: 12px 16px; border-bottom: 1px solid var(--hairline);">
      <span class="pos-cart-title" style="font-size:16px; font-weight:700; color:var(--ink); display:flex; align-items:center; gap:8px;">
        ${IconCart} Giỏ hàng
      </span>
      <span class="cart-count-badge" id="cart-count-badge" style="background:var(--primary); color:#fff; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700;">0</span>
    </div>

    <!-- Table Selection -->
    <div class="pos-table-section" style="padding: 12px 16px; border-bottom:1px solid var(--hairline); background:var(--canvas-cream);">
      <label class="form-label" style="font-size:11px; display:flex; align-items:center; gap:6px; color:var(--ink-mute); font-weight:700; text-transform:uppercase;">
        ${IconPin} Chọn Bàn ăn (Dine-in)
      </label>
      <select class="form-control" id="pos-table-select" style="margin-top:6px; min-height:36px; height:36px; padding:6px 12px; font-size:13.5px; border-radius:var(--radius-md);">
        <option value="">Khách mang đi (Takeaway)</option>
      </select>
    </div>

    <!-- Cart Items -->
    <div class="pos-cart-items" id="pos-cart-items" style="flex:1; overflow-y:auto; padding: 4px 0;">
      <div class="cart-empty">
        <div class="icon">${IconCart}</div>
        <p>Giỏ hàng trống<br/><small>Chọn sản phẩm bên trái</small></p>
      </div>
    </div>

    <!-- Summary & Payment -->
    <div class="pos-cart-summary" style="border-top:1px solid var(--hairline); padding: 8px 12px; background:var(--canvas-cream);">
      <div id="pos-summary"></div>
      <div class="pos-pay-buttons" style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:6px;">
        <button class="btn btn-success" id="pay-cash-btn" style="padding: 8px 12px; font-size:13.5px; font-weight:600; display:flex; align-items:center; justify-content:center; gap:6px; min-height:36px;">
          ${IconCash} Tiền mặt
        </button>
        <button class="btn btn-primary" id="pay-qr-btn" style="padding: 8px 12px; font-size:13.5px; font-weight:600; display:flex; align-items:center; justify-content:center; gap:6px; min-height:36px;">
          ${IconQR} QR PayOS
        </button>
      </div>
      <button class="btn btn-ghost btn-full btn-sm" id="clear-cart-btn" style="margin-top:6px; color:var(--error); display:flex; align-items:center; justify-content:center; gap:4px; font-size:12px; min-height:28px; padding:4px 8px;">
        ${IconTrash} Xóa giỏ hàng
      </button>
    </div>
  </div>
`;

export const init = async () => {
  // Load data: categories, products, active tables
  const [catRes, prodRes, tableRes] = await Promise.all([
    api.get('/api/categories').catch(() => ({ data: [] })),
    api.get('/api/products?is_available=true').catch(() => ({ data: [] })),
    api.get('/api/tables?status=available').catch(() => ({ data: [] }))
  ]);

  categories = catRes?.data || [];
  products = prodRes?.data || [];
  tables = tableRes?.data || [];

  // Render Table dropdown
  const tableSelect = document.getElementById('pos-table-select');
  if (tableSelect) {
    tableSelect.innerHTML = `
      <option value="">Khách mang đi (Takeaway)</option>
      ${tables.map(t => `<option value="${t.id}">${t.name} (Sức chứa: ${t.capacity} - ${t.area.toUpperCase()})</option>`).join('')}
    `;
    tableSelect.addEventListener('change', (e) => {
      selectedTableId = e.target.value;
    });
  }

  // Render tabs
  const tabsEl = document.getElementById('pos-tabs');
  if (tabsEl) {
    tabsEl.innerHTML = `
      <button class="pos-tab active" data-cat="all">Tất cả</button>
      ${categories.map(c => `<button class="pos-tab" data-cat="${c.id}">${c.name}</button>`).join('')}
    `;
    tabsEl.querySelectorAll('.pos-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        tabsEl.querySelectorAll('.pos-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedCategory = btn.dataset.cat;
        document.getElementById('pos-product-grid').innerHTML = renderProductGrid();
        attachProductEvents();
      });
    });
  }

  // Render products
  document.getElementById('pos-product-grid').innerHTML = renderProductGrid();
  attachProductEvents();

  // Search
  document.getElementById('pos-search')?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    document.getElementById('pos-product-grid').innerHTML = renderProductGrid();
    attachProductEvents();
  });

  // Event delegation for Discount / Loyalty Gift button
  document.getElementById('pos-summary')?.addEventListener('click', (e) => {
    const btn = e.target.closest('#open-discount-modal-btn');
    if (btn) openDiscountModal();
  });

  // Payment buttons
  document.getElementById('pay-cash-btn')?.addEventListener('click', handlePayCash);
  document.getElementById('pay-qr-btn')?.addEventListener('click', handlePayQR);
  document.getElementById('clear-cart-btn')?.addEventListener('click', () => {
    if (cart.length) resetCart();
  });

  renderCart();
  renderSummary();
};

const attachProductEvents = () => {
  document.querySelectorAll('.pos-product-card:not(.unavailable)').forEach(card => {
    card.addEventListener('click', () => addToCart(card.dataset.productId));
  });
};
