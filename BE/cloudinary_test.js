/**
 * cloudinary_test.js — Kiểm tra tích hợp Cloudinary
 * Chạy: node cloudinary_test.js
 */
'use strict';

const cloudinary = require('cloudinary').v2;

// ── Cấu hình Cloudinary (inline) ─────────────────────
cloudinary.config({
  cloud_name: 'dy4dzmd75',       // ← Cloud name của bạn
  api_key:    '626766445939399', // ← API Key của bạn
  api_secret: 'THUBss8DLhktvkvqjgXAbtCbI48', // ← API Secret của bạn
});

(async () => {
  // ── STEP 1: Upload ảnh mẫu từ Cloudinary demo ────────
  console.log('\n📤 Đang upload ảnh...');
  const uploadResult = await cloudinary.uploader.upload(
    'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    { public_id: 'cafe_test_sample', overwrite: true }
  );

  console.log('✅ Upload thành công!');
  console.log('   Secure URL :', uploadResult.secure_url);
  console.log('   Public ID  :', uploadResult.public_id);

  // ── STEP 2: Lấy metadata ảnh đã upload ───────────────
  console.log('\n📋 Đang lấy thông tin ảnh...');
  const details = await cloudinary.api.resource(uploadResult.public_id);

  console.log('   Kích thước :', details.width, '×', details.height, 'px');
  console.log('   Định dạng  :', details.format.toUpperCase());
  console.log('   Dung lượng :', details.bytes, 'bytes (',
    (details.bytes / 1024).toFixed(1), 'KB)');

  // ── STEP 3: Transform ảnh với f_auto + q_auto ─────────
  // f_auto: Cloudinary tự chọn định dạng tối ưu (WebP, AVIF...) tuỳ theo trình duyệt
  // q_auto: Cloudinary tự điều chỉnh chất lượng để giảm dung lượng tối đa mà không mất chất lượng thấy được
  const transformedUrl = cloudinary.url(uploadResult.public_id, {
    fetch_format: 'auto', // f_auto
    quality: 'auto',      // q_auto
    secure: true,
  });

  console.log('\n🔗 URL ảnh đã tối ưu (f_auto + q_auto):');
  console.log('  ', transformedUrl);
  console.log('\n✨ Done! Click link trên để xem ảnh đã tối ưu.');
  console.log('   Kiểm tra kích thước file và định dạng trong browser DevTools (Network tab).');
})().catch(err => {
  console.error('\n❌ Lỗi:', err.message || err);
  process.exit(1);
});
