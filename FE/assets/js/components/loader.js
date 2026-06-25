/**
 * loader.js — Global spinner overlay
 * Sử dụng: Loader.show(), Loader.hide()
 */

let loaderCount = 0;

const ensureLoader = () => {
  if (document.getElementById('global-loader')) return;
  const loader = document.createElement('div');
  loader.id = 'global-loader';
  loader.innerHTML = `
    <div style="
      display:flex; flex-direction:column; align-items:center; gap:16px;
    ">
      <div class="loader-ring"></div>
      <span style="color:var(--ink-mute);font-size:0.875rem;font-family:'Inter',sans-serif">Đang tải...</span>
    </div>
  `;
  loader.style.cssText = `
    position: fixed; inset: 0; z-index: 9998;
    display: none; align-items: center; justify-content: center;
    background: rgba(15, 23, 42, 0.4);
    backdrop-filter: blur(4px);
  `;

  if (!document.getElementById('loader-style')) {
    const style = document.createElement('style');
    style.id = 'loader-style';
    style.textContent = `
      .loader-ring {
        width: 44px; height: 44px;
        border: 3px solid var(--primary-light);
        border-top-color: var(--primary);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(loader);
};

export const Loader = {
  show() {
    ensureLoader();
    loaderCount++;
    const el = document.getElementById('global-loader');
    if (el) el.style.display = 'flex';
  },
  hide() {
    loaderCount = Math.max(0, loaderCount - 1);
    if (loaderCount === 0) {
      const el = document.getElementById('global-loader');
      if (el) el.style.display = 'none';
    }
  },
};
