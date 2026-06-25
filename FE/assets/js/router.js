/**
 * router.js — Hash Router với Route Guards
 */
import { Sidebar } from './components/sidebar.js';

const getUser = () => {
  try { return JSON.parse(localStorage.getItem('cafe_user')); }
  catch { return null; }
};

const getToken = () => localStorage.getItem('cafe_token');

const routes = {
  '#login':     () => import('./views/login.js'),
  '#dashboard': () => import('./views/dashboard.js'),
  '#pos':       () => import('./views/pos.js'),
  '#products':  () => import('./views/products.js'),
  '#invoices':  () => import('./views/invoices.js'),
  '#customers': () => import('./views/customers.js'),
  '#tables':    () => import('./views/tables.js'),
  '#vouchers':  () => import('./views/vouchers.js'),
  '#shifts':    () => import('./views/shifts.js'),
  '#reports':   () => import('./views/reports.js'),
  '#users':     () => import('./views/users.js'),
};

// Admin-only routes
const adminRoutes = new Set(['#dashboard', '#products', '#customers', '#vouchers', '#users', '#reports']);

const navigate = async (hash) => {
  const token = getToken();
  const user = getUser();

  // Chưa đăng nhập → về login
  if (!token || !user) {
    if (hash !== '#login') {
      window.location.hash = '#login';
      return;
    }
  }

  // Đã đăng nhập mà vào #login → về trang chính
  if (token && user && hash === '#login') {
    window.location.hash = user.role === 'admin' ? '#dashboard' : '#pos';
    return;
  }

  // Kiểm tra quyền Admin-only
  if (adminRoutes.has(hash) && user?.role !== 'admin') {
    window.location.hash = '#pos';
    return;
  }

  const loader = routes[hash];
  if (!loader) {
    // Route không tồn tại → về POS
    window.location.hash = token ? '#pos' : '#login';
    return;
  }

  // Toggle sidebar visibility
  const body = document.body;
  const sidebar = document.getElementById('sidebar');
  if (hash === '#login') {
    body.classList.add('no-sidebar');
    if (sidebar) sidebar.innerHTML = '';
  } else {
    body.classList.remove('no-sidebar');
    // Chỉ render sidebar khi nó chưa có nội dung (tránh render lại liên tục gây chớp đen màn hình)
    if (sidebar && sidebar.innerHTML.trim() === '') {
      Sidebar.render();
    }
  }

  try {
    const view = await loader();
    const container = document.getElementById('view-container');
    if (container) {
      container.innerHTML = view.render();
      await view.init();
    }
    Sidebar.updateActive();
  } catch (err) {
    console.error('[ROUTER] Failed to load view:', err);
    document.getElementById('view-container').innerHTML = `
      <div class="page">
        <div class="empty-state" style="margin-top:80px">
          <div class="icon">⚠️</div>
          <p>Không thể tải trang này.<br/><small>${err.message}</small></p>
        </div>
      </div>
    `;
  }
};

export const initRouter = () => {
  const handleHash = () => {
    let hash = window.location.hash;
    if (!hash || hash === '#') {
      const token = getToken();
      const user = getUser();
      if (token && user) {
        hash = user.role === 'admin' ? '#dashboard' : '#pos';
      } else {
        hash = '#login';
      }
      window.location.hash = hash;
      return;
    }
    navigate(hash);
  };

  window.addEventListener('hashchange', handleHash);
  handleHash();
};
