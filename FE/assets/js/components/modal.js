/**
 * modal.js — Modal dùng chung
 * Sử dụng: Modal.open({ title, content, onConfirm, confirmText, cancelText, hideFooter })
 *          Modal.close()
 */

let styleInjected = false;

const injectStyle = () => {
  if (styleInjected) return;
  styleInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    #modal-container {
      position: fixed; inset: 0; z-index: 9000;
      display: none; align-items: center; justify-content: center;
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(4px);
      padding: 20px;
    }
    #modal-container.open { display: flex; }
    .modal-box {
      background: var(--canvas);
      border: 1px solid var(--hairline);
      border-radius: 16px;
      width: 100%;
      max-width: 520px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.15), 0 0 1px 1px rgba(15, 23, 42, 0.05);
      animation: modalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes modalIn {
      from { opacity:0; transform: scale(0.96) translateY(-8px); }
      to   { opacity:1; transform: scale(1) translateY(0); }
    }
    .modal-header {
      padding: 18px 24px;
      border-bottom: 1px solid var(--hairline);
      display: flex; align-items: center; justify-content: space-between;
    }
    .modal-title {
      font-size: 1.125rem; font-weight: 600;
      color: var(--ink); font-family: 'Inter', sans-serif;
    }
    .modal-close {
      background: none; border: none; cursor: pointer;
      color: var(--ink-mute); font-size: 1.25rem;
      width: 32px; height: 32px; border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.15s ease;
    }
    .modal-close:hover { background: var(--primary-light); color: var(--primary); }
    .modal-body { padding: 24px; overflow-y: auto; flex: 1; color: var(--ink); }
    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--hairline);
      display: flex; justify-content: flex-end; gap: 8px;
    }
    .modal-lg .modal-box { max-width: 700px; }
    .modal-xl .modal-box { max-width: 900px; }
    
    /* Custom style support for modal form fields and inline label icons */
    .form-group {
      margin-bottom: 16px;
    }
    .form-label {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 6px;
      font-size: 13.5px;
      font-weight: 600;
      color: var(--text-secondary);
    }
    .form-label svg {
      color: var(--primary);
      flex-shrink: 0;
    }
  `;
  document.head.appendChild(style);
};

export const Modal = {
  open({ title = '', content = '', onConfirm = null, confirmText = 'Xác nhận', cancelText = 'Hủy', hideFooter = false, size = '', danger = false, onClose = null } = {}) {
    injectStyle();
    const container = document.getElementById('modal-container');
    if (!container) return;

    container.className = `open${size ? ' modal-' + size : ''}`;
    container.innerHTML = `
      <div class="modal-box" id="modal-box">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close" id="modal-close-btn">✕</button>
        </div>
        <div class="modal-body">${typeof content === 'string' ? content : ''}</div>
        ${!hideFooter ? `
          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm" id="modal-cancel-btn">${cancelText}</button>
            ${onConfirm ? `<button class="btn ${danger ? 'btn-danger' : 'btn-primary'} btn-sm" id="modal-confirm-btn">${confirmText}</button>` : ''}
          </div>
        ` : ''}
      </div>
    `;

    // If content is DOM element, append it
    if (content && typeof content === 'object') {
      container.querySelector('.modal-body').appendChild(content);
    }

    // Events
    const closeBtn = document.getElementById('modal-close-btn');
    const cancelBtn = document.getElementById('modal-cancel-btn');
    const confirmBtn = document.getElementById('modal-confirm-btn');

    const close = () => {
      Modal.close();
      if (onClose) onClose();
    };
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (cancelBtn) cancelBtn.addEventListener('click', close);
    if (confirmBtn && onConfirm) confirmBtn.addEventListener('click', () => onConfirm());

    // Click outside to close
    container.addEventListener('click', (e) => {
      if (e.target === container) close();
    });

    return container;
  },

  close() {
    const container = document.getElementById('modal-container');
    if (container) {
      container.className = '';
      container.innerHTML = '';
    }
  },

  // Confirm dialog shorthand
  confirm({ title = 'Xác nhận', message = 'Bạn có chắc chắn?', onConfirm, confirmText = 'Xác nhận', danger = false } = {}) {
    return Modal.open({
      title,
      content: `<p style="color:var(--ink);font-family:'Inter',sans-serif;line-height:1.6">${message}</p>`,
      onConfirm,
      confirmText,
      danger,
    });
  },
};
