'use strict';
const ExcelJS = require('exceljs');

/**
 * Generate Excel report containing requested sheets: Doanh thu, Sản phẩm, Nhân viên, Khách hàng, Vouchers, Nhật ký
 */
async function generateExcelReport({ revenue, products, staff, customers, vouchers, logs, invoices }) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Cafe Management System';
  workbook.created = new Date();

  // Định dạng tiền tệ và ngày tháng
  const currencyFmt = '#,##0" VNĐ"';
  const dateFmt = 'dd/mm/yyyy';
  const datetimeFmt = 'dd/mm/yyyy hh:mm:ss';

  // 1. Doanh thu Sheet
  if (revenue) {
    const revenueSheet = workbook.addWorksheet('Doanh thu');
    revenueSheet.columns = [
      { header: 'Ngày', key: 'date', width: 18 },
      { header: 'Số đơn hàng', key: 'total_orders', width: 15 },
      { header: 'Tổng tạm tính', key: 'total_subtotal', width: 22 },
      { header: 'Giảm Loyalty', key: 'discount_loyalty', width: 22 },
      { header: 'Giảm Voucher', key: 'discount_voucher', width: 22 },
      { header: 'Tổng giảm giá', key: 'discount_total', width: 22 },
      { header: 'Doanh thu thuần', key: 'net_revenue', width: 22 }
    ];

    revenueSheet.getColumn('date').numFmt = dateFmt;
    revenueSheet.getColumn('total_orders').numFmt = '#,##0';
    revenueSheet.getColumn('total_subtotal').numFmt = currencyFmt;
    revenueSheet.getColumn('discount_loyalty').numFmt = currencyFmt;
    revenueSheet.getColumn('discount_voucher').numFmt = currencyFmt;
    revenueSheet.getColumn('discount_total').numFmt = currencyFmt;
    revenueSheet.getColumn('net_revenue').numFmt = currencyFmt;

    revenue.forEach(row => {
      revenueSheet.addRow({
        date: row.date ? new Date(row.date) : '',
        total_orders: parseInt(row.total_orders) || 0,
        total_subtotal: parseFloat(row.total_subtotal || (row.total_revenue + row.total_discount)) || 0,
        discount_loyalty: parseFloat(row.total_discount_loyalty) || 0,
        discount_voucher: parseFloat(row.total_discount_voucher) || 0,
        discount_total: parseFloat(row.total_discount) || 0,
        net_revenue: parseFloat(row.net_revenue || row.total_revenue) || 0
      });
    });
  }

  // 2. Sản phẩm Sheet
  if (products) {
    const productsSheet = workbook.addWorksheet('Sản phẩm');
    productsSheet.columns = [
      { header: 'Tên sản phẩm', key: 'name', width: 30 },
      { header: 'Số lượng bán', key: 'total_quantity', width: 15 },
      { header: 'Tổng doanh thu', key: 'total_revenue', width: 22 }
    ];
    productsSheet.getColumn('total_quantity').numFmt = '#,##0';
    productsSheet.getColumn('total_revenue').numFmt = currencyFmt;

    products.forEach(row => {
      productsSheet.addRow({
        name: row.name,
        total_quantity: parseInt(row.total_quantity) || 0,
        total_revenue: parseFloat(row.total_revenue) || 0
      });
    });
  }

  // 3. Nhân viên Sheet
  if (staff) {
    const staffSheet = workbook.addWorksheet('Nhân viên');
    staffSheet.columns = [
      { header: 'Nhân viên', key: 'full_name', width: 25 },
      { header: 'Số ca làm', key: 'total_shifts', width: 15 },
      { header: 'Tổng giờ làm thực tế', key: 'total_hours', width: 22 },
      { header: 'Tổng lương nhận (VND)', key: 'total_salary', width: 22 },
      { header: 'Doanh số bán lẻ (VND)', key: 'total_sales', width: 22 }
    ];
    staffSheet.getColumn('total_shifts').numFmt = '#,##0';
    staffSheet.getColumn('total_hours').numFmt = '#,##0.0';
    staffSheet.getColumn('total_salary').numFmt = currencyFmt;
    staffSheet.getColumn('total_sales').numFmt = currencyFmt;

    staff.forEach(row => {
      staffSheet.addRow({
        full_name: row.full_name,
        total_shifts: parseInt(row.total_shifts) || 0,
        total_hours: parseFloat(row.total_hours) || 0,
        total_salary: parseFloat(row.total_salary) || 0,
        total_sales: parseFloat(row.total_sales) || 0
      });
    });
  }

  // 4. Khách hàng Sheet
  if (customers) {
    const customersSheet = workbook.addWorksheet('Khách hàng');
    customersSheet.columns = [
      { header: 'Tên khách hàng', key: 'full_name', width: 25 },
      { header: 'Số điện thoại', key: 'phone', width: 18 },
      { header: 'Số đơn hàng', key: 'total_orders', width: 15 },
      { header: 'Tổng chi tiêu (VND)', key: 'total_spent', width: 22 }
    ];
    customersSheet.getColumn('total_orders').numFmt = '#,##0';
    customersSheet.getColumn('total_spent').numFmt = currencyFmt;

    customers.forEach(row => {
      customersSheet.addRow({
        full_name: row.full_name,
        phone: row.phone || '',
        total_orders: parseInt(row.total_orders) || 0,
        total_spent: parseFloat(row.total_spent) || 0
      });
    });
  }

  // 5. Vouchers Sheet
  if (vouchers) {
    const vouchersSheet = workbook.addWorksheet('Vouchers');
    vouchersSheet.columns = [
      { header: 'Mã Voucher', key: 'code', width: 18 },
      { header: 'Loại', key: 'type', width: 15 },
      { header: 'Giá trị', key: 'value', width: 18 },
      { header: 'Lượt dùng', key: 'used_count', width: 15 },
      { header: 'Giới hạn dùng', key: 'usage_limit', width: 18 },
      { header: 'Tổng tiền giảm (VND)', key: 'total_discount', width: 22 }
    ];
    vouchersSheet.getColumn('used_count').numFmt = '#,##0';
    vouchersSheet.getColumn('total_discount').numFmt = currencyFmt;

    vouchers.forEach(row => {
      const val = parseFloat(row.value) || 0;
      const valFmt = row.type === 'percent' ? '0"%"' : currencyFmt;
      
      const addedRow = vouchersSheet.addRow({
        code: row.code,
        type: row.type === 'percent' ? 'Phần trăm' : 'Cố định',
        value: val,
        used_count: parseInt(row.used_count) || 0,
        usage_limit: row.usage_limit !== null ? parseInt(row.usage_limit) : 'Không giới hạn',
        total_discount: parseFloat(row.total_discount) || 0
      });

      addedRow.getCell('value').numFmt = valFmt;
    });
  }

  // 6. Nhật ký Sheet
  if (logs) {
    const logsSheet = workbook.addWorksheet('Nhật ký');
    logsSheet.columns = [
      { header: 'Thời gian', key: 'created_at', width: 22 },
      { header: 'Tên đăng nhập', key: 'username', width: 18 },
      { header: 'Người thực hiện', key: 'full_name', width: 25 },
      { header: 'Hành động', key: 'action', width: 22 },
      { header: 'Chi tiết hành động', key: 'description', width: 55 }
    ];
    logsSheet.getColumn('created_at').numFmt = datetimeFmt;

    const translateAction = (action) => {
      const map = {
        'LOGIN': 'Đăng nhập',
        'LOGOUT': 'Đăng xuất',
        'CREATE_ORDER': 'Tạo đơn hàng',
        'CANCEL_ORDER': 'Hủy đơn hàng',
        'DELETE_ORDER': 'Xóa đơn nháp',
        'PAY_CASH': 'Thanh toán tiền mặt',
        'PAY_QR': 'Yêu cầu thanh toán QR',
        'CREATE_USER': 'Tạo tài khoản',
        'UPDATE_USER': 'Cập nhật tài khoản',
        'DELETE_USER': 'Xóa tài khoản',
        'TOGGLE_USER_STATUS': 'Khóa/Kích hoạt tài khoản',
        'CREATE_PRODUCT': 'Tạo sản phẩm',
        'UPDATE_PRODUCT': 'Cập nhật sản phẩm',
        'DELETE_PRODUCT': 'Xóa sản phẩm',
        'CREATE_CATEGORY': 'Tạo danh mục',
        'UPDATE_CATEGORY': 'Cập nhật danh mục',
        'DELETE_CATEGORY': 'Xóa danh mục',
        'CREATE_TABLE': 'Tạo bàn ăn',
        'UPDATE_TABLE': 'Cập nhật bàn ăn',
        'DELETE_TABLE': 'Xóa bàn ăn',
        'CREATE_VOUCHER': 'Tạo khuyến mãi',
        'UPDATE_VOUCHER': 'Cập nhật khuyến mãi',
        'DELETE_VOUCHER': 'Xóa khuyến mãi',
        'START_SHIFT': 'Bắt đầu ca làm',
        'END_SHIFT': 'Kết thúc ca làm',
        'CHECK_IN': 'Chấm công vào',
        'CHECK_OUT': 'Chấm công ra',
        'CLEANED_TABLE': 'Giải phóng bàn'
      };
      return map[action] || action;
    };

    logs.forEach(row => {
      logsSheet.addRow({
        created_at: row.created_at ? new Date(String(row.created_at).replace(' ', 'T')) : '',
        username: row.username || '',
        full_name: row.full_name || '',
        action: translateAction(row.action),
        description: row.description || ''
      });
    });
  }

  // 7. Hóa đơn Sheet
  if (invoices) {
    const invoicesSheet = workbook.addWorksheet('Hóa đơn');
    invoicesSheet.columns = [
      { header: 'Mã HĐ', key: 'order_code', width: 15 },
      { header: 'Khách hàng', key: 'customer_name', width: 25 },
      { header: 'Số điện thoại', key: 'customer_phone', width: 18 },
      { header: 'Thu ngân', key: 'cashier_name', width: 25 },
      { header: 'Tạm tính', key: 'subtotal', width: 18 },
      { header: 'Giảm giá', key: 'discount_total', width: 18 },
      { header: 'Tổng tiền', key: 'total', width: 18 },
      { header: 'Phương thức', key: 'payment_method', width: 18 },
      { header: 'Trạng thái', key: 'payment_status', width: 18 },
      { header: 'Thời gian tạo', key: 'created_at', width: 22 }
    ];

    invoicesSheet.getColumn('subtotal').numFmt = currencyFmt;
    invoicesSheet.getColumn('discount_total').numFmt = currencyFmt;
    invoicesSheet.getColumn('total').numFmt = currencyFmt;
    invoicesSheet.getColumn('created_at').numFmt = datetimeFmt;

    const translateStatus = (status) => {
      const map = {
        'paid': 'Đã thanh toán',
        'pending': 'Chờ thanh toán',
        'cancelled': 'Đã hủy'
      };
      return map[status] || status;
    };

    const translateMethod = (method) => {
      const map = {
        'cash': 'Tiền mặt',
        'qr': 'Chuyển khoản'
      };
      return map[method] || method;
    };

    invoices.forEach(row => {
      invoicesSheet.addRow({
        order_code: row.order_code || ('#' + String(row.id).padStart(6, '0')),
        customer_name: row.customer_name || 'Khách lẻ',
        customer_phone: row.customer_phone || '',
        cashier_name: row.cashier_name || '',
        subtotal: parseFloat(row.subtotal) || 0,
        discount_total: parseFloat(row.discount_total) || 0,
        total: parseFloat(row.total) || 0,
        payment_method: translateMethod(row.payment_method),
        payment_status: translateStatus(row.payment_status),
        created_at: row.created_at ? new Date(String(row.created_at).replace(' ', 'T')) : ''
      });
    });
  }

  // Định dạng mặc định & Thêm Auto Filter cho Header của các sheet được tạo
  workbook.worksheets.forEach(ws => {
    ws.getRow(1).font = { bold: true };
    ws.getRow(1).fill = null;
    ws.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: ws.columns.length }
    };
  });

  return await workbook.xlsx.writeBuffer();
}

module.exports = { generateExcelReport };
