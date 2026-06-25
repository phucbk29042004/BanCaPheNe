/**
 * api.js — Fetch Wrapper dùng chung toàn ứng dụng
 * - Tự động đính kèm Authorization header
 * - Xử lý 401 → logout + redirect #login
 * - Xử lý 403 → toast cảnh báo
 * - Wrap Loader.show/hide quanh mỗi request
 */

import { Loader } from './components/loader.js';
import { Toast } from './components/toast.js';

const BASE_URL = '';  // Same origin

const getToken = () => localStorage.getItem('cafe_token');

const logout = () => {
  localStorage.removeItem('cafe_token');
  localStorage.removeItem('cafe_user');
  window.location.hash = '#login';
};

const request = async (method, path, body = null, isFormData = false) => {
  Loader.show();
  const headers = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const options = { method, headers };
  if (body) {
    options.body = isFormData ? body : JSON.stringify(body);
  }

  try {
    const res = await fetch(`${BASE_URL}${path}`, options);
    const data = await res.json();

    if (res.status === 401) {
      logout();
      throw new Error('Phiên đăng nhập đã hết hạn.');
    }

    if (res.status === 403) {
      Toast.warning('Bạn không có quyền thực hiện thao tác này.');
      throw new Error(data.message || 'Không có quyền truy cập.');
    }

    return data;
  } catch (err) {
    if (err.message && !err.message.includes('Phiên') && !err.message.includes('quyền')) {
      // Network error
    }
    throw err;
  } finally {
    Loader.hide();
  }
};

export const api = {
  get:    (path)              => request('GET',    path),
  post:   (path, body)        => request('POST',   path, body),
  put:    (path, body)        => request('PUT',    path, body),
  patch:  (path, body)        => request('PATCH',  path, body),
  delete: (path)              => request('DELETE', path),
  upload: (path, formData)    => request('POST',   path, formData, true),
  uploadPut: (path, formData) => request('PUT',    path, formData, true),
};
