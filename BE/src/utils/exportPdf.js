'use strict';
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate PDF report
 */
function generatePdfReport({ revenue, products, staff, customers, vouchers }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', err => reject(err));

      // Register Arial font for Vietnamese unicode support
      const fontPath = 'C:\\Windows\\Fonts\\arial.ttf';
      if (fs.existsSync(fontPath)) {
        doc.font(fontPath);
      }

      // Title Page / Header
      doc.fillColor('#4A154B').fontSize(24).text('BÁO CÁO TỔNG HỢP HOẠT ĐỘNG KINH DOANH', { align: 'center' });
      doc.fillColor('#1D1D1D').fontSize(12).text(`Ngày xuất báo cáo: ${new Date().toLocaleString('vi-VN')}`, { align: 'center' });
      doc.moveDown(2);

      // Section: Doanh thu
      doc.fillColor('#4A154B').fontSize(16).text('1. Thống kê Doanh thu', { underline: true });
      doc.moveDown(0.5);
      doc.fillColor('#1D1D1D').fontSize(10);
      doc.text('Ngày | Số đơn | Tổng tạm tính | Giảm giá | Doanh thu thuần', { bold: true });
      doc.text('------------------------------------------------------------------------------------------------------');
      if (revenue && revenue.length) {
        revenue.slice(0, 10).forEach(row => {
          const subtotal = row.total_subtotal || (row.total_revenue + row.total_discount);
          doc.text(`${row.date} | ${row.total_orders} đơn | ${subtotal.toLocaleString()}đ | -${(row.total_discount || 0).toLocaleString()}đ | ${(row.net_revenue || row.total_revenue).toLocaleString()}đ`);
        });
      } else {
        doc.text('(Không có dữ liệu)');
      }
      doc.moveDown(1.5);

      // Section: Sản phẩm bán chạy
      doc.fillColor('#4A154B').fontSize(16).text('2. Top Sản phẩm', { underline: true });
      doc.moveDown(0.5);
      doc.fillColor('#1D1D1D').fontSize(10);
      doc.text('Tên sản phẩm | Danh mục | Số lượng bán | Tổng doanh thu', { bold: true });
      doc.text('------------------------------------------------------------------------------------------------------');
      if (products && products.length) {
        products.slice(0, 10).forEach(row => {
          doc.text(`${row.name} | ${row.category_name} | ${row.total_quantity} | ${(row.total_revenue || 0).toLocaleString()}đ`);
        });
      } else {
        doc.text('(Không có dữ liệu)');
      }
      doc.moveDown(1.5);

      // Section: Hiệu suất nhân viên
      doc.fillColor('#4A154B').fontSize(16).text('3. Hiệu suất nhân ca làm việc', { underline: true });
      doc.moveDown(0.5);
      doc.fillColor('#1D1D1D').fontSize(10);
      doc.text('Nhân viên | Ca làm | Giờ làm thực tế | Lương ca | Doanh số', { bold: true });
      doc.text('------------------------------------------------------------------------------------------------------');
      if (staff && staff.length) {
        staff.slice(0, 10).forEach(row => {
          doc.text(`${row.full_name} | ${row.total_shifts} ca | ${row.total_hours.toFixed(1)}h | ${(row.total_salary || 0).toLocaleString()}đ | ${(row.total_sales || 0).toLocaleString()}đ`);
        });
      } else {
        doc.text('(Không có dữ liệu)');
      }
      doc.moveDown(1.5);

      // Footer note
      doc.fillColor('#696969').fontSize(8).text('Báo cáo được tạo tự động bởi Hệ thống Quản lý Quán Cà Phê.', 50, 720, { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generatePdfReport };
