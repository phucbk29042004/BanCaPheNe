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
