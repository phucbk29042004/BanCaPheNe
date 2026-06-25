/**
 * sidebar.js — Render sidebar navigation với tính năng Thu gọn/Mở rộng
 */

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem('cafe_user'));
  } catch { return null; }
};

const getHash = () => window.location.hash || '#pos';

const navItems = [
  { hash: '#dashboard', label: 'Tổng quan', icon: '✦', roles: ['admin'] },
  { hash: '#pos', label: 'Bán hàng (POS)', icon: '►', roles: ['admin', 'staff'] },
  { hash: '#tables', label: 'Sơ đồ bàn', icon: '❖', roles: ['admin', 'staff'] },
  { hash: '#shifts', label: 'Ca làm & Chấm công', icon: '◷', roles: ['admin', 'staff'] },
  { label: 'Quản lý', type: 'separator', roles: ['admin'] },
  { hash: '#products', label: 'Sản phẩm', icon: '✦', roles: ['admin'] },
  { hash: '#customers', label: 'Khách hàng', icon: '⚉', roles: ['admin'] },
  { hash: '#vouchers', label: 'Khuyến mãi', icon: '%', roles: ['admin'] },
  { hash: '#users', label: 'Nhân viên', icon: '⚙', roles: ['admin'] },
  { hash: '#invoices', label: 'Hóa đơn', icon: '☷', roles: ['admin', 'staff'] },
  { hash: '#reports', label: 'Báo cáo thống kê', icon: '☱', roles: ['admin'] },
];

const renderInitial = (name = '') => (name || 'U').charAt(0).toUpperCase();

export const Sidebar = {
  render() {
    const user = getUser();
    const sidebar = document.getElementById('sidebar');
    if (!sidebar || !user) return;

    const currentHash = getHash();
    const isCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
    if (isCollapsed) {
      document.body.classList.add('sidebar-collapsed');
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }

    const navHtml = navItems
      .filter(item => !item.roles || item.roles.includes(user.role))
      .map(item => {
        if (item.type === 'separator') {
          return `<div class="sidebar-section-label"><span class="label-text">${item.label}</span></div>`;
        }
        const isActive = currentHash === item.hash;
        return `
          <a class="sidebar-link${isActive ? ' active' : ''}" data-hash="${item.hash}" href="${item.hash}" title="${item.label}">
            <span class="nav-icon">${item.icon}</span>
            <span class="nav-label">${item.label}</span>
          </a>
        `;
      })
      .join('');

    sidebar.innerHTML = `
      <div class="sidebar-header">
        <a class="sidebar-logo" href="#pos">
          <div class="logo-icon" style="background: rgba(255, 255, 255, 0.2);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:#fff;"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>
          </div>
          <div class="logo-text">
            <span class="logo-name" style="letter-spacing: 0.5px;">ANH TÔI ĐẤY COFFEE</span>
            <span class="logo-tagline" style="letter-spacing: 1px; font-weight: 600;">COFFEE & TEA</span>
          </div>
        </a>
        <button class="sidebar-toggle-btn" id="sidebar-toggle-btn" title="Thu gọn / Mở rộng">
          <span class="toggle-icon-expand">◀</span>
          <span class="toggle-icon-collapse">☰</span>
        </button>
      </div>
      <nav class="sidebar-nav">${navHtml}</nav>
      <div class="sidebar-footer">
        <div class="sidebar-footer-user">
          <div class="sidebar-avatar">${renderInitial(user.full_name)}</div>
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">${user.full_name}</div>
            <div class="sidebar-user-role">${user.role === 'admin' ? 'Quản lý' : 'Nhân viên'}</div>
          </div>
        </div>
        <button class="sidebar-logout" id="sidebar-logout-btn" title="Đăng xuất">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    `;

    // Logout handler
    document.getElementById('sidebar-logout-btn')?.addEventListener('click', () => {
      localStorage.removeItem('cafe_token');
      localStorage.removeItem('cafe_user');
      window.location.hash = '#login';
    });

    // Toggle handler
    document.getElementById('sidebar-toggle-btn')?.addEventListener('click', () => {
      const collapsed = document.body.classList.toggle('sidebar-collapsed');
      localStorage.setItem('sidebar_collapsed', collapsed ? 'true' : 'false');
    });

    // Mobile menu toggle
    document.getElementById('mobile-menu-toggle-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      document.body.classList.toggle('mobile-sidebar-open');
    });

    // Close mobile menu when clicking a link
    document.querySelectorAll('.sidebar-link').forEach(link => {
      link.addEventListener('click', () => {
        document.body.classList.remove('mobile-sidebar-open');
      });
    });

    // Click outside to close mobile sidebar
    document.addEventListener('click', (e) => {
      if (document.body.classList.contains('mobile-sidebar-open')) {
        const sidebar = document.getElementById('sidebar');
        const mobileBtn = document.getElementById('mobile-menu-toggle-btn');
        if (sidebar && !sidebar.contains(e.target) && e.target !== mobileBtn) {
          document.body.classList.remove('mobile-sidebar-open');
        }
      }
    });
  },

  updateActive() {
    const currentHash = getHash();
    document.querySelectorAll('.sidebar-link').forEach(link => {
      link.classList.toggle('active', link.dataset.hash === currentHash);
    });
  },
};
