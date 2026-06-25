/**
 * toast.js — Thông báo toast toàn app
 * Sử dụng: Toast.success(msg), Toast.error(msg), Toast.warning(msg)
 */

const createToast = (message, type = 'success') => {
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const bgColors = {
    success: '#10b981', // Solid Emerald green
    error:   '#ef4444', // Solid Red
    warning: '#f59e0b', // Solid Amber/Orange
    info:    '#3b82f6', // Solid Blue
  };

  const toast = document.createElement('div');
  toast.style.cssText = `
    display: flex; align-items: center; gap: 12px;
    padding: 14px 20px; margin-bottom: 8px;
    background: ${bgColors[type]};
    border-radius: var(--radius-md);
    color: #ffffff;
    font-family: 'Inter', sans-serif;
    font-size: 0.9rem;
    font-weight: 700;
    max-width: 380px;
    min-width: 260px;
    box-shadow: rgba(15, 23, 42, 0.15) 0 8px 30px;
    animation: toastIn 0.3s ease forwards;
    cursor: pointer;
    border-left: 5px solid rgba(0,0,0,0.15);
  `;
  toast.innerHTML = `
    <span style="font-size:1.15rem;">${icons[type]}</span>
    <span style="flex:1; line-height: 1.4;">${message}</span>
  `;

  const container = document.getElementById('toast-container');
  if (!container) return;

  if (!document.getElementById('toast-style')) {
    const style = document.createElement('style');
    style.id = 'toast-style';
    style.textContent = `
      #toast-container {
        position: fixed; top: 24px; right: 24px;
        z-index: 99999; display: flex; flex-direction: column; align-items: flex-end;
      }
      @keyframes toastIn {
        from { opacity: 0; transform: translateY(-10px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes toastOut {
        from { opacity: 1; transform: translateY(0); }
        to   { opacity: 0; transform: translateY(-10px); }
      }
    `;
    document.head.appendChild(style);
  }

  container.appendChild(toast);

  const dismiss = () => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  };

  toast.addEventListener('click', dismiss);
  setTimeout(dismiss, 3500);
};

export const Toast = {
  success: (msg) => createToast(msg, 'success'),
  error:   (msg) => createToast(msg, 'error'),
  warning: (msg) => createToast(msg, 'warning'),
  info:    (msg) => createToast(msg, 'info'),
};
