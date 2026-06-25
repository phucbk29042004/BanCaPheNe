/**
 * app.js — Entry point của SPA
 * Khởi tạo router và các global event listeners
 */
import { initRouter } from './router.js';

// Khởi động ứng dụng
initRouter();

// Expose Modal globally để có thể gọi từ onclick trong HTML strings
import { Modal } from './components/modal.js';
window.Modal = Modal;

// Lắng nghe sự kiện wheel để hỗ trợ cuộn ngang bằng chuột
window.addEventListener('wheel', (e) => {
  const container = e.target.closest('.table-wrapper, .pos-tabs, [style*="overflow-x: auto"]');
  if (container) {
    const canScrollLeft = container.scrollWidth > container.clientWidth;
    if (canScrollLeft && Math.abs(e.deltaY) > 0) {
      container.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  }
}, { passive: false });
