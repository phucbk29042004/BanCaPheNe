/**
 * login.js — View đăng nhập
 * Layout: Split — Trái: ảnh quán cà phê | Phải: form đăng nhập
 */
import { api } from '../api.js';
import { Toast } from '../components/toast.js';

export const render = () => `
  <div class="login-split">

    <!-- ── LEFT PANEL: Ảnh quán cà phê ─────────────── -->
    <div class="login-panel-left">
      <!-- Pastel-mesh gradient overlay -->
      <div class="login-left-overlay"></div>

      <!-- Nội dung trên ảnh -->
      <div class="login-left-content">
        <div class="login-brand" style="gap: 10px;">
          <div class="login-brand-icon" style="background: rgba(255, 255, 255, 0.2); width: 42px; height: 42px; border-radius: 10px;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:#fff;"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>
          </div>
          <div>
            <div class="login-brand-name" style="letter-spacing: 0.5px; font-size: 18px;">ANH TÔI ĐẤY COFFEE</div>
            <div class="login-brand-tagline" style="letter-spacing: 1px; font-size: 9px; font-weight: 700;">COFFEE & TEA</div>
          </div>
        </div>

        <div class="login-hero">
          <h1 class="login-hero-title">
            Quản lý quán cà phê<br/>
            <span class="login-hero-accent">thông minh hơn</span>
          </h1>
          <p class="login-hero-desc">
            Theo dõi doanh thu, quản lý sản phẩm và chăm sóc khách hàng thân thiết — tất cả trong một nơi.
          </p>
        </div>

        <!-- Stats strip -->
        <div class="login-stats">
          <div class="login-stat">
            <div class="login-stat-value">99%</div>
            <div class="login-stat-label">Uptime</div>
          </div>
          <div class="login-stat-divider"></div>
          <div class="login-stat">
            <div class="login-stat-value">3s</div>
            <div class="login-stat-label">Xuất hóa đơn</div>
          </div>
          <div class="login-stat-divider"></div>
          <div class="login-stat">
            <div class="login-stat-value">QR</div>
            <div class="login-stat-label">Thanh toán</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── RIGHT PANEL: Form đăng nhập ─────────────── -->
    <div class="login-panel-right">
      <div class="login-form-wrap" style="background: rgba(255, 255, 255, 0.7); padding: 32px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.7); backdrop-filter: blur(10px); box-shadow: 0 20px 40px -15px rgba(0,0,0,0.05);">

        
        <!-- Heading -->
        <h2 class="login-form-title" style="font-size: 24px; margin-bottom: 4px;">Đăng nhập</h2>
        <p class="login-form-subtitle" style="font-size: 13.5px; margin-bottom: 24px;">
          Nhập thông tin tài khoản để tiếp tục vào hệ thống.
        </p>

        <!-- Form -->
        <form id="login-form" class="login-form" autocomplete="on">
          <div class="form-group" style="margin-bottom: 16px;">
            <label class="form-label" for="login-username" style="font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px;">Tên đăng nhập</label>
            <div class="login-input-wrap">
              <span class="login-input-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--ink-mute);"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
              <input
                class="form-control login-input"
                type="text"
                id="login-username"
                name="username"
                placeholder="Nhập tên đăng nhập"
                autocomplete="username"
                required
                style="height: 42px; padding-left: 42px !important; border-radius: 8px; border: 1px solid var(--hairline);"
              />
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 20px;">
            <label class="form-label" for="login-password" style="font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px;">Mật khẩu</label>
            <div class="login-input-wrap">
              <span class="login-input-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--ink-mute);"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </span>
              <input
                class="form-control login-input"
                type="password"
                id="login-password"
                name="password"
                placeholder="Nhập mật khẩu"
                autocomplete="current-password"
                required
                style="height: 42px; padding-left: 42px !important; padding-right: 42px !important; border-radius: 8px; border: 1px solid var(--hairline);"
              />
              <button type="button" class="login-pw-toggle" id="pw-toggle" title="Hiện/ẩn mật khẩu" style="top: 50%; transform: translateY(-50%);">
                <span id="pw-eye" style="display:flex; align-items:center;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-full"
            id="login-submit-btn"
            style="height: 42px; border-radius: 8px; font-weight: 700; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border: none; box-shadow: 0 4px 12px rgba(37,99,235,0.2); transition: all 0.2s;"
          >
            Đăng nhập
          </button>
        </form>

        <!-- Footer -->
    </div>

  </div>
`;

export const init = () => {
  // Password visibility toggle
  const pwToggle = document.getElementById('pw-toggle');
  const pwInput = document.getElementById('login-password');
  const pwEye = document.getElementById('pw-eye');
  pwToggle?.addEventListener('click', () => {
    const show = pwInput.type === 'password';
    pwInput.type = show ? 'text' : 'password';
    pwEye.innerHTML = show
      ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`
      : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
  });

  // Demo account fill buttons
  document.querySelectorAll('.login-demo-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('login-username').value = btn.dataset.user;
      document.getElementById('login-password').value = btn.dataset.pass;
      document.getElementById('login-password').type = 'password';
      if (pwEye) pwEye.textContent = '[o]';
    });
  });

  // Form submit
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('login-submit-btn');
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
      Toast.warning('Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Đang đăng nhập...';

    try {
      const res = await api.post('/api/auth/login', { username, password });
      if (res.success) {
        localStorage.setItem('cafe_token', res.data.token);
        localStorage.setItem('cafe_user', JSON.stringify(res.data.user));
        Toast.success(`Xin chào, ${res.data.user.full_name}!`);
        window.location.hash = res.data.user.role === 'admin' ? '#dashboard' : '#pos';
      } else {
        Toast.error(res.message || 'Tên đăng nhập hoặc mật khẩu không đúng.');
        shakeForm();
      }
    } catch (err) {
      Toast.error(err.message || 'Không thể kết nối đến máy chủ.');
      shakeForm();
    } finally {
      btn.disabled = false;
      btn.textContent = 'Đăng nhập';
    }
  });
};

const shakeForm = () => {
  const wrap = document.querySelector('.login-form-wrap');
  if (!wrap) return;
  wrap.style.animation = 'none';
  wrap.offsetHeight; // reflow
  wrap.style.animation = 'loginShake 0.45s ease';
};
