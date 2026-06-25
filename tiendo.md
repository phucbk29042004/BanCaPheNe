### 24/06/2026 10:55 — Dọn dẹp Unicode Emoji & Căn chỉnh Nút bấm
- **Loại**: Chỉnh sửa
- **File**: `FE/assets/js/views/reports.js`, `FE/assets/js/views/dashboard.js`, `FE/assets/js/views/login.js`, `FE/assets/js/views/pos.js`, `FE/assets/js/views/shifts.js`
- **Mô tả**: Thay thế toàn bộ Unicode Emoji còn sót lại bằng các SVG Icons chuyên nghiệp (như icon báo cáo, tải xuống, máy in, liên kết, tải dữ liệu, quà tặng, vé...). Đồng thời đồng bộ class của nút bấm (btn-sm, btn-primary, btn-outline) và cấu trúc hiển thị để giao diện nhất quán và mượt mà hơn.
- **Kết quả**: Thành công. Không còn emoji nào trong các file view giao diện.

### 24/06/2026 11:09 — Đồng bộ màu sắc Modal, Confirm và Loader sang Brand Styles mới
- **Loại**: Chỉnh sửa
- **File**: `FE/assets/js/components/modal.js`, `FE/assets/js/components/loader.js`, `FE/assets/js/views/dashboard.js`
- **Mô tả**: Thay đổi mã màu cũ (nền nâu tối, chữ cam/vàng cát) trong modal overlay, loader ring, thông báo xác nhận và lưới biểu đồ (chart grid/ticks) sang bộ nhận diện thương hiệu mới (nền sáng trắng, viền nhạt `--hairline`, chữ `--ink` và xanh dương `--primary`).
- **Kết quả**: Thành công. Toàn bộ các popup và loader đã đồng bộ giao diện mượt mà và hiện đại.

### 24/06/2026 11:40 — Cải thiện Sidebar, Xóa page-title, Tối ưu khoảng trắng & Responsive Mobile
- **Loại**: Chỉnh sửa
- **File**: `FE/assets/css/sidebar.css`, `FE/assets/css/main.css`, `FE/index.html`, `FE/assets/js/components/sidebar.js`, các file JS trong `FE/assets/js/views/`
- **Mô tả**: 
  1. Ẩn hoàn toàn logo icon khi thu nhỏ sidebar, sửa lỗi hiển thị tooltip do thuộc tính `overflow: hidden`.
  2. Xóa bỏ hoàn toàn thẻ tiêu đề trang `page-title` ở các file JS, gom các nút hành động vào thanh bộ lọc/tìm kiếm để tiết kiệm không gian hiển thị, giảm 20-30% khoảng cách trống giữa các phần.
  3. Căn chỉnh hiển thị Table: thu hẹp padding, giảm font-size và thiết lập `white-space: nowrap` cho các cột quan trọng giúp tránh vỡ dòng.
  4. Thực hiện Responsive di động và máy tính bảng: Thêm thanh mobile-header có nút menu hamburger, thiết lập sidebar hoạt động như ngăn kéo (drawer) trượt ẩn mượt mà, căn chỉnh lại lề của các lưới và bộ lọc trên màn hình nhỏ.
- **Kết quả**: Thành công. Ứng dụng hiển thị cực kỳ chuyên nghiệp và mượt mà trên cả desktop và mobile.

### 24/06/2026 11:50 — Nâng cấp thẩm mỹ Sidebar, Làm đậm viền và Giảm khoảng trắng tối đa
- **Loại**: Chỉnh sửa
- **File**: `FE/assets/css/sidebar.css`, `FE/assets/css/main.css`, `FE/assets/css/pos.css`, các file JS trong `FE/assets/js/views/`
- **Mô tả**:
  1. Nâng cấp thiết kế Menu Sidebar: Đổi màu nền sang dải màu gradient xanh dương, chuyển các nút menu thành dạng bo tròn góc (`8px`) có khoảng cách đệm lề, thêm hiệu ứng hover phát sáng nền trắng mờ và bóng đổ glow trắng sang trọng khi rê chuột và khi được kích hoạt.
  2. Làm đậm viền: Tăng độ đậm và tương phản của viền bảng dữ liệu (Table), dòng kẻ ngang (`tr`) và toàn bộ các ô nhập liệu tìm kiếm/bộ lọc (`input`, `select`) từ màu xám nhạt khó nhìn sang màu xám đậm (`#cbd5e1` và `#94a3b8`) trên toàn bộ ứng dụng và giao diện POS.
  3. Giảm khoảng trắng: Tiếp tục thu hẹp khoảng cách lề dưới (`margin-bottom`) của các thanh bộ lọc/tìm kiếm trong các file JS từ `12px` xuống còn `8px` để tiết kiệm tối đa không gian màn hình.
- **Kết quả**: Thành công. Giao diện sắc nét, trực quan và hiện đại hơn rất nhiều.
### 24/06/2026 12:05 — Chia đôi màn hình POS và Tích hợp Modal chọn Voucher & Loyalty SĐT
- **Loại**: Chỉnh sửa
- **File**: `FE/assets/js/views/pos.js`, `FE/assets/css/pos.css`
- **Mô tả**:
  1. Thay đổi bố cục POS thành chia đôi 2 Card theo tỷ lệ 6-4: Card chọn món (60%) và Card giỏ hàng (40%), thiết kế viền nổi bật và bo góc đồng bộ brand.
  2. Gom cụm tính năng tìm số điện thoại khách hàng Loyalty (-10%) và chọn Mã khuyến mãi (Voucher) vào chung một Modal Pop-up mới bằng nút bấm icon Quà tặng (`#open-discount-modal-btn`) đặt phía trên phần tính tiền tạm tính.
  3. Cập nhật logic tìm kiếm khách hàng, tạo khách hàng mới ngay trong modal, và chọn trực tiếp Voucher từ danh sách kéo cuộn (`max-height: 240px`) có hiển thị điều kiện đơn tối thiểu.
  4. Đăng ký lại toàn bộ sự kiện click/input cho modal và dọn dẹp các sự kiện cũ trong hàm `init()`.
  5. Tinh chỉnh thiết kế phần Tổng cộng (Total) và nút thanh toán trong POS: Thu nhỏ chữ "TỔNG CỘNG" xuống 15px, giảm padding và font-size của các nút Tiền mặt/QR PayOS xuống 13.5px (cao 36px), thu nhỏ nút xóa giỏ hàng giúp bố cục gọn gàng, vừa mắt.

### 24/06/2026 13:50 — Thiết kế lại Footer Sidebar và Đồng bộ màu nút bấm CRUD
- **Loại**: Chỉnh sửa
- **File**: `FE/assets/js/components/sidebar.js`, `FE/assets/css/sidebar.css`, `FE/assets/js/components/modal.js`, `FE/assets/js/components/confirm.js`, `FE/assets/js/views/products.js`, `FE/assets/js/views/tables.js`, `FE/assets/js/views/shifts.js`, `FE/assets/js/views/vouchers.js`
- **Mô tả**:
  1. Giao diện Sidebar: Di chuyển khối thông tin người dùng (tên & vai trò quản lý/nhân viên) xuống đáy menu cùng cấp và nằm ngang hàng với nút Đăng xuất. Nút Đăng xuất được rút gọn chỉ hiển thị một Icon logout, có đổi màu đỏ khi hover. Thiết kế chế độ thu gọn (collapsed) tự xếp dọc tinh tế.
  2. Đồng bộ hóa màu sắc CRUD:
     - Thêm/Tạo: Giữ màu chủ đạo Xanh dương (`btn-primary`).
     - Sửa/Điều chỉnh: Giữ màu Xám/Trung tính (`btn-secondary` hoặc `btn-ghost`).
     - Xóa/Hủy: Cập nhật component Modal và Confirm để tự động sử dụng nút đỏ nguy hiểm (`btn-danger`) khi gọi xác nhận với cờ `danger: true`. Kích hoạt cờ này tại toàn bộ các tác vụ xóa sản phẩm, xóa bàn, hủy ca trực, xóa voucher.

### 24/06/2026 14:00 — Modal Chọn Size POS, Thiết Kế Lại Sơ Đồ Bàn & Đồng Bộ Chiều Cao Ô Input
- **Loại**: Chỉnh sửa
- **File**: `FE/assets/js/views/pos.js`, `BE/src/controllers/orderController.js`, `FE/assets/css/tables.css`, `FE/assets/css/pos.css`, `FE/assets/css/main.css`
- **Mô tả**:
  1. POS Option Modal: Ẩn hiển thị giá trực tiếp trên card sản phẩm. Khi click vào card, hiển thị Modal cho phép chọn Size (Size M mặc định, Size L +10.000đ), thay đổi số lượng và nhập ghi chú. Đã đồng bộ logic tính toán ở cả Frontend và Backend để cập nhật giá trị hóa đơn chính xác.
  2. Sơ đồ bàn: Thiết kế lại `.table-card` nhỏ gọn hơn (min-height từ 160px xuống 115px, grid-columns từ 220px xuống 170px), thu nhỏ chữ và padding để sơ đồ bàn nhìn cân đối, đỡ trống trải.
  3. Đồng bộ chiều cao: Thu nhỏ các ô input tìm kiếm/lọc (`.form-control` trong `.filter-bar`, thanh tìm kiếm POS, ô chọn bàn ăn) đồng loạt xuống `36px` để tương thích và thẳng hàng với các nút bấm bên cạnh.

### 24/06/2026 14:05 — Sửa Lỗi CSP, Tăng Kích Thước Ảnh POS & Giảm 100px Chiều Ngang Trang
- **Loại**: Sửa bug / Chỉnh sửa
- **File**: `BE/app.js`, `FE/assets/css/pos.css`, `FE/assets/css/main.css`
- **Mô tả**:
  1. Sửa lỗi CSP: Thêm `scriptSrcAttr: ["'unsafe-inline'"]` vào middleware bảo mật Helmet giúp trình duyệt cho phép chạy các hành động `onclick` do giao diện JS sinh ra.
  2. Nâng cấp Ảnh POS: Tăng chiều cao vùng chứa ảnh sản phẩm từ `110px` lên `135px` và giảm cỡ chữ của tên món xuống `12.5px` giúp hình ảnh nổi bật hơn rõ rệt.
  3. Giảm chiều ngang trang: Điều chỉnh chiều rộng tối đa `.page` từ `1320px` xuống `1220px` (giảm đúng 100px) để giao diện các chức năng quản lý nhìn gọn gàng và vừa vặn hơn trên các màn hình lớn.
  4. Sửa lỗi Chưa xác thực khi In/Xuất file: Cập nhật middleware `authenticate.js` ở Backend cho phép nhận Token qua cả tham số `query.token` (bên cạnh header Authorization). Đồng thời đính kèm tham số `token` ở đầu Url khi gọi mở tab mới (`window.open` hoặc link `<a>`) cho việc in hóa đơn (trong POS, trang chi tiết hóa đơn, và danh sách hóa đơn `invoices.js`) và xuất báo cáo Excel/PDF.
- **Kết quả**: Thành công. Không còn lỗi chặn script, giao diện đẹp mắt và gọn gàng hơn.

### 24/06/2026 14:30 — Định Dạng Tiền Tệ, Tích Hợp QR PayOS & Sắp Xếp Hóa Đơn Mới Nhất
- **Loại**: Chỉnh sửa / Tính năng mới
- **File**: `BE/.env`, `BE/src/controllers/orderController.js`, `BE/src/controllers/invoiceController.js`, các file FE: `pos.js`, `invoices.js`, `dashboard.js`, `products.js`, `customers.js`, `vouchers.js`, `users.js`, `tables.js`, `reports.js`
- **Mô tả**:
  1. **Định dạng tiền tệ**: Định dạng tất cả các trường hiển thị tiền tệ trên ứng dụng theo format chuẩn `1.000.000 VNĐ` (như: đơn giá, giảm giá, tạm tính, tổng tiền, lương nhân viên...).
  2. **Thanh toán QR PayOS**:
     - Cập nhật cấu hình PayOS chính xác trong file `BE/.env`.
     - Tích hợp hàm làm sạch mô tả `cleanDescription` tại `orderController.js` nhằm lọc sạch dấu tiếng Việt và ký tự đặc biệt, đảm bảo tuân thủ tiêu chuẩn của PayOS.
     - Nâng cấp modal thanh toán QR PayOS tại `pos.js` để tự động tạo và hiển thị trực tiếp mã QR Code mượt mà ngay trên màn hình thu ngân (thông qua API qrserver), giúp thanh toán nhanh chóng mà không cần chuyển hướng trang.
     - **Sửa lỗi CSP**: Cập nhật chỉ thị `img-src` trong cấu hình CSP của Helmet ở `BE/app.js` để cho phép hiển thị ảnh mã QR từ `https://api.qrserver.com`.
     - **Tối ưu luồng & Hủy đơn tự động**: Tích hợp callback `onClose` cho Component Modal dùng chung (`FE/assets/js/components/modal.js`). Khi thu ngân đóng modal QR hoặc bấm "Hủy giao dịch", hệ thống sẽ tự động gọi API hủy đơn hàng ở backend để chuyển trạng thái về `cancelled`, không để lại các đơn hàng rác ở trạng thái `pending`.
     - **Phân quyền hủy đơn**: Điều chỉnh middleware và controller ở backend cho phép cả thu ngân (Staff) hủy các đơn hàng `pending` do chính mình tạo ra ở POS.
  3. **Sắp xếp hóa đơn**: Điều chỉnh câu lệnh truy vấn SQLite ở cả API danh sách đơn hàng và API hóa đơn để luôn sắp xếp theo thứ tự `id DESC`, đưa các hóa đơn và đơn hàng mới tạo lên đầu tiên một cách chính xác tuyệt đối.
  4. **Thiết kế lại Card Tổng quan (Dashboard)**:
     - Cập nhật [dashboard.js](file:///d:/BanCaPhe/FE/assets/js/views/dashboard.js) để chèn thêm các khối chỉ số tăng trưởng kèm icon biểu đồ tăng trưởng xanh lá mượt mà dưới mỗi card.
     - Điều chỉnh [dashboard.css](file:///d:/BanCaPhe/FE/assets/css/dashboard.css): Tăng độ rộng tối thiểu của mỗi Card lên `260px` trong CSS Grid và tạo phong cách sang trọng cho nhãn hiển thị tăng trưởng `.stat-growth`.
- **Kết quả**: Thành công. Giao diện trực quan, trải nghiệm thanh toán QR vô cùng thuận tiện và các card tổng quan hiển thị thông tin rõ ràng, sang trọng.

### 24/06/2026 15:00 — Chuyển Đổi Giao Diện Khuyến Mãi & Nhân Sự Sang Dạng Card
- **Loại**: Chỉnh sửa / Cải thiện UI UX
- **File**: `FE/assets/js/views/vouchers.js`, `FE/assets/js/views/users.js`, `FE/assets/css/main.css`
- **Mô tả**:
  1. **Khuyến mãi (Voucher)**: Chuyển đổi từ dạng bảng sang lưới các Ticket Card độc đáo (giống cuống vé giảm giá viền đứt, mã code in đậm, giá trị giảm giá to bắt mắt). Khi click vào Card sẽ mở Modal thông tin chi tiết chương trình. Các nút hành động (Sửa, Xóa, Lịch sử, Toggle) được gom gọn gàng dưới chân Card.
  2. **Nhân viên (User)**: Chuyển đổi từ dạng bảng sang lưới các Profile Card nhân viên (hiển thị Avatar chữ cái đầu tròn màu sắc, vai trò, số điện thoại, hệ số lương/giờ). Bấm vào Card mở Modal chi tiết nhân sự.
  3. **CSS Card**: Định nghĩa các class `.vouchers-grid`, `.users-grid`, `.voucher-card`, `.user-card` cùng các hiệu ứng hover, shadow mượt mà trong `main.css`.
- **Kết quả**: Thành công. Trải nghiệm xem thông tin thuận mắt, thao tác tự nhiên và chuyên nghiệp hơn rất nhiều.

### 24/06/2026 15:05 — Nâng Cấp Định Dạng Tiền Tệ Động Khi Nhập Liệu & Sửa Lỗi Gán Ngày
- **Loại**: Cải thiện UI UX / Sửa bug
- **File**: `FE/assets/js/views/vouchers.js`, `FE/assets/js/views/users.js`, `FE/assets/js/views/products.js`
- **Mô tả**:
  1. **Định dạng tiền tệ động**: Chuyển các input nhập tiền tệ (giá bán sản phẩm, lương theo giờ, giá trị voucher, đơn tối thiểu, giảm tối đa) sang định dạng `type="text"`. Khi người dùng gõ số, hệ thống tự động chèn dấu chấm phân cách hàng nghìn và hậu tố `VNĐ` (Ví dụ: `50.000 VNĐ`) trực quan ngay lập tức. Khi gửi form, dữ liệu tự động parse ngược về kiểu số để lưu trữ chính xác.
  2. **Sửa lỗi ngày tháng**: Khắc phục lỗi ngày hiệu lực của Voucher hiển thị trống rỗng khi mở Form chỉnh sửa. Đã thêm chữ `T` thay thế khoảng trắng (`valid_from.replace(' ', 'T')`) để phù hợp với quy chuẩn hiển thị `<input type="datetime-local">` trên trình duyệt theo định dạng locale của máy khách (`dd/mm/yyyy`).
- **Kết quả**: Thành công. Giao diện nhập liệu cực kỳ mượt mà, ngày tháng tải chính xác và thuận mắt người dùng.

### 24/06/2026 15:10 — Khắc Phục Lỗi Cú Pháp Dấu Ngoặc Nhọn Ở Vouchers View
- **Loại**: Sửa bug
- **File**: `FE/assets/js/views/vouchers.js`
- **Mô tả**: Loại bỏ dấu ngoặc nhọn dư thừa `};` ở cuối hàm `openEditVoucherModal` (dòng 495), khắc phục lỗi `SyntaxError: Unexpected token '}'` gây đứng router trên giao diện.
- **Kết quả**: Thành công. Giao diện hoạt động trơn tru trở lại.### 24/06/2026 16:05 — Thêm Tab Tài Khoản Hệ Thống & Sửa Lỗi Hủy Thanh Toán QR PayOS
- **Loại**: Tính năng mới / Chỉnh sửa
- **File**: `BE/src/controllers/orderController.js`, `BE/src/routes/orders.js`, `BE/src/controllers/userController.js`, `BE/src/routes/users.js`, `FE/assets/js/views/pos.js`, `FE/assets/js/views/users.js`
- **Mô tả**:
  1. **Hóa đơn PayOS**: Thêm API xóa cứng đơn hàng nháp `DELETE /api/orders/:id` ở backend. Cập nhật frontend `pos.js` khi đóng modal QR hoặc click hủy giao dịch, gọi API xóa đơn hàng này để dọn rác và giải phóng bàn tức thì thay vì đổi trạng thái sang `cancelled`, tránh hiển thị hóa đơn rác tại mục quản lý hóa đơn.
  2. **Tài khoản hệ thống**:
     - Thiết lập cấu trúc hai tab trong trang quản lý Nhân sự: **Nhân sự & Lương** và **Tài khoản hệ thống**.
     - Ở tab Tài khoản hệ thống: Hiển thị các thông tin liên quan đến tài khoản đăng nhập (username, vai trò, trạng thái kích hoạt).
     - Thêm API `DELETE /api/users/:id` ở backend để hỗ trợ xóa cứng tài khoản. Nếu tài khoản đã có liên kết ca trực hoặc hóa đơn (dính khóa ngoại), backend tự động bắt lỗi và thông báo cho người dùng sử dụng chức năng Khóa tài khoản thay thế.
- **Kết quả**: Thành công. Luồng thanh toán QR PayOS sạch sẽ và quản trị tài khoản hệ thống hoàn tất.

### 25/06/2026 08:30 — Khắc phục lỗi giật màn hình Router, Tăng Rate Limit & Giữ trạng thái Bàn ăn
- **Loại**: Sửa bug / Chỉnh sửa
- **File**: `FE/assets/js/router.js`, `BE/src/middlewares/rateLimiter.js`, `BE/src/controllers/orderController.js`, `BE/src/controllers/payosController.js`, `FE/assets/js/views/tables.js`
- **Mô tả**:
  1. **Router nhấp nháy**: Thay đổi logic khởi tạo Router trong `router.js` kiểm tra trực tiếp token/role của user khi hash URL trống để gán thẳng trang đích, tránh chuyển tiếp trung gian qua trang đăng nhập gây giật giao diện.
  2. **Lỗi 429**: Nâng giới hạn `generalLimiter` trong `rateLimiter.js` từ 100 lên 2000 request / 15 phút để đáp ứng cơ chế polling hóa đơn và tải trang Dashboard.
  3. **Trạng thái Bàn**: Loại bỏ tính năng tự động chuyển bàn về "Trống" sau khi thanh toán thành công (Tiền mặt/QR) ở `orderController.js` và `payosController.js` để phản ánh đúng thực tế khách hàng đang ăn tại bàn.
  4. **Giải phóng Bàn**: Thêm modal xác nhận và nút "Giải phóng bàn" (Đánh dấu trống) trong sơ đồ bàn `tables.js` nếu bàn đó đang "Có khách" nhưng không còn đơn hàng pending.
- **Kết quả**: Thành công.

### 25/06/2026 09:30 — Thực hiện 8 Nâng Cấp Hệ Thống & Sửa Lỗi UI UX Lớn
- **Loại**: Tính năng mới / Sửa bug / Cải thiện UI UX
- **File**: `customers.js`, `users.js`, `invoices.js`, `reports.js`, `pos.js`, `dashboard.js`, `main.css`, `dashboard.css`, `orderController.js`, `reportController.js`
- **Mô tả**:
  1. **Bộ lọc Khách hàng & Nhân viên**: Thêm các bộ lọc chi tiêu, số đơn cho Khách hàng và bộ lọc vai trò, trạng thái cho Nhân sự & Tài khoản.
  2. **Hóa đơn - Định dạng Ngày**: Chuyển date picker sang ô nhập text có mask dạng `dd/mm/yyyy`, khi gửi API tự động parse sang `YYYY-MM-DD`.
  3. **Báo cáo doanh thu & Phân trang**: Backend trả về dữ liệu so sánh hôm nay/hôm qua, tuần này/tuần trước, tháng này/tháng trước. Frontend render 4 card so sánh thật (không mock data) và tích hợp phân trang 10 dòng cho bảng số liệu doanh thu.
  4. **Đồng bộ chiều cao Card Nhân viên**: Cập nhật CSS `.user-card` và `users.js` để đẩy các nút hành động xuống đáy card bằng flex layout và thiết lập `height: 100%`.
  5. **Sửa ảnh trong modal**: Sửa lỗi preview ảnh khi upload/edit sản phẩm trong `products.js`.
  6. **POS - Gợi ý SĐT**: Tích hợp autocomplete gợi ý SĐT + Tên khách hàng khi gõ trực tiếp SĐT trong modal POS.
  7. **Giao diện Dashboard**: Sửa CSS grid giữ nguyên 4 card trên một hàng không bị rớt dòng và phân trang 10 record cho bảng đơn hàng gần nhất.
  8. **Hủy hóa đơn & Hoàn tiền**: Thêm tính năng cho phép Admin hủy hóa đơn đã thanh toán (`paid`) ngay trong modal chi tiết, hiển thị số tiền hoàn trả, nhập lý do hủy và tự động trừ chi tiêu/số đơn của khách hàng, cập nhật doanh thu thực tế.
- **Kết quả**: Thành công vượt trội, giao diện mượt mà và đồng bộ.

### 25/06/2026 09:40 — Tối Ưu Card Nhân Sự & Tích Hợp Upload Avatar Nhân Viên
- **Loại**: Cải thiện UI UX / Tính năng mới
- **File**: `FE/assets/css/main.css`, `FE/assets/js/views/users.js`
- **Mô tả**:
  1. **Tối ưu khoảng trắng Card nhân sự**: Giảm padding của `.user-card` và margin-bottom của `.user-avatar`, `.user-username`, `.user-role-badge` để giao diện lưới nhân viên gọn gàng, đẹp mắt và đồng bộ khoảng trắng.
  2. **Tải lên & Hiển thị Avatar nhân viên**: Cập nhật cả 2 tab (Nhân sự & Lương, Tài khoản hệ thống) để hiển thị ảnh avatar thực tế từ Cloudinary thông qua thuộc tính `avatar_url`. Tích hợp trường chọn ảnh (`<input type="file">`) và khung preview thời gian thực trong modal Thêm mới & Chỉnh sửa nhân sự. Chuyển đổi logic gửi API sang dùng `FormData` với `api.upload` / `api.uploadPut`.
- **Kết quả**: Thành công. Ứng dụng chạy mượt mà, ảnh đại diện cập nhật tức thì.

### 25/06/2026 09:45 — Thiết Kế Lại Modal Giao Diện & Thêm Icon Nhãn (Label) Trực Quan
- **Loại**: Cải thiện UI UX
- **File**: `FE/assets/js/components/modal.js`, `FE/assets/js/views/customers.js`, `FE/assets/js/views/users.js`, `FE/assets/js/views/products.js`, `FE/assets/js/views/tables.js`, `FE/assets/js/views/vouchers.js`
- **Mô tả**:
  1. **Nâng cấp style Modal chung**: Thay đổi thiết kế của `.modal-box` tại `modal.js` sang kiểu bo góc `16px` hiện đại, tăng hiệu ứng bóng đổ có chiều sâu (`box-shadow`), và mở rộng padding để giao diện thoáng, tinh tế hơn.
  2. **Thêm style hỗ trợ Icon trước Label**: Thiết lập `.form-label` có dạng `display: flex` giúp thẳng hàng và tự động co giãn khi có SVG icon đi kèm.
  3. **Tích hợp SVG Icon vào các label trong modal form**: Cập nhật HTML modal tại 5 view chính (Khách hàng, Nhân viên, Sản phẩm, Bàn ăn, Khuyến mãi) để chèn các icon SVG tinh tế (như SĐT, Họ tên, Giá bán, Sức chứa, Thời gian hiệu lực...) vào trước nhãn tương ứng.
- **Kết quả**: Giao diện các modal nhập liệu trở nên cực kỳ chuyên nghiệp, trực quan và bắt mắt.

### 25/06/2026 09:50 — Cân Đối Bảng Hóa Đơn, Sửa Ngày Biểu Đồ & Thiết Kế Lại Logo, Màu Sắc Menu
- **Loại**: Cải thiện UI UX / Sửa bug
- **File**: `FE/assets/js/views/invoices.js`, `FE/assets/js/views/dashboard.js`, `FE/assets/js/views/reports.js`, `FE/assets/css/sidebar.css`, `FE/assets/js/components/sidebar.js`
- **Mô tả**:
  1. **Bảng hóa đơn**: Thêm `white-space: nowrap` vào thẻ `<table>` trong `invoices.js` để triệt tiêu hiện tượng rớt dòng của các cột dữ liệu khi Menu sidebar ở trạng thái mở rộng.
  2. **Biểu đồ doanh thu**: Cập nhật hàm load dữ liệu biểu đồ trục X của trang Dashboard (`dashboard.js`) và trang Báo cáo (`reports.js`) để tự động chuyển định dạng ngày từ `YYYY-MM-DD` sang `dd/mm/yyyy` trực quan.
  3. **Thiết kế Logo & Màu sắc Sidebar**:
     - Thay đổi mã màu nền của sidebar trong `sidebar.css` từ xanh dương đậm sang dải màu gradient xanh dương nhạt dịu mát (`#3b82f6` sang `#2563eb`).
     - Thay thế icon logo cũ `✦` bằng Icon ly cà phê SVG bốc khói tinh tế tại `sidebar.js`. Đồng thời nâng cấp tên thương hiệu sang `ANTIGRAVITY` (chữ in hoa đậm nét) và tagline `COFFEE & TEA`.
  4. **Đồng bộ định dạng ngày**: Quét toàn bộ hệ thống frontend và xác nhận định dạng ngày hiển thị đã đồng bộ chuẩn `dd/mm/yyyy` ở tất cả các bảng biểu và lịch ca trực.
- **Kết quả**: Giao diện hiển thị cân đối, biểu đồ hiển thị ngày chuẩn, logo và menu sidebar mang đậm màu sắc thương hiệu cao cấp.

### 25/06/2026 10:40 — Thiết Kế Lại Giao Diện Màn Hình Đăng Nhập (Login)
- **Loại**: Cải thiện UI UX
- **File**: `FE/assets/js/views/login.js`, `FE/assets/css/main.css`
- **Mô tả**:
  1. **Nâng cấp thẩm mỹ**: Thiết kế lại màn hình đăng nhập sang phong cách Modern Glassmorphism với nền kính mờ, đổ bóng siêu mượt và bo góc lớn. 
  2. **Đồng bộ màu sắc thương hiệu**: Thay đổi dải màu phủ (overlay) ảnh quán cà phê ở khung bên trái sang màu xanh dương phối xám navy (đồng bộ với màu xanh nhạt mới của menu sidebar).
  3. **Tích hợp SVG Icons**: Thay thế biểu tượng thô sơ `✦` bằng các SVG icon trực quan: ly cà phê bốc khói màu trắng cho Logo, icon Tài khoản, icon Mật khẩu và icon Con mắt (nhắm/mở) cho tính năng ẩn hiện mật khẩu.
  4. **Logo & Bản quyền**: Thay thế chữ hiển thị thương hiệu sang `ANTIGRAVITY COFFEE & TEA`.
- **Kết quả**: Giao diện đăng nhập hiện đại, cuốn hút và rất cao cấp.

### 25/06/2026 10:42 — Thay Đổi Tên Thương Hiệu Hệ Thống Sang Phúc Coffee & Tea
- **Loại**: Chỉnh sửa
- **File**: `FE/assets/js/components/sidebar.js`, `FE/assets/js/views/login.js`
- **Mô tả**: Thay thế toàn bộ từ khóa tên thương hiệu cũ `ANTIGRAVITY` sang tên thương hiệu mới **PHÚC COFFEE & TEA** tại menu sidebar và giao diện đăng nhập (bao gồm logo, bản quyền chân trang và tiêu đề quản lý).
- **Kết quả**: Hệ thống đã đổi tên thương hiệu nhất quán trên mọi giao diện hiển thị.

### 25/06/2026 11:00 — Sửa Lỗi Cuộn Ngang Bảng & Mở Quyền Xem Voucher Cho Nhân Viên (Staff)
- **Loại**: Sửa bug / Chỉnh sửa phân quyền
- **File**: `FE/assets/css/main.css`, `BE/src/routes/vouchers.js`
- **Mô tả**:
  1. **Cuộn ngang bảng (Table Scroll)**: Thiết lập `min-width: 850px;` cho thẻ `table` bên trong `.table-wrapper` trong `main.css`. Điều này giải quyết triệt để lỗi bảng dữ liệu (nhất là bảng hóa đơn của nhân viên) bị rớt dòng chữ hoặc bóp méo khi thu nhỏ màn hình/mở rộng menu, tự động kích hoạt thanh cuộn ngang mượt mà.
  2. **Phân quyền Voucher cho Staff**: Thay đổi phân quyền route `GET /api/vouchers` tại `vouchers.js` ở Backend từ `authorize('admin')` sang `authorize('admin', 'staff')`. Điều này cho phép Nhân viên (Staff) xem được danh sách mã giảm giá để áp dụng cho khách hàng tại quầy POS mà vẫn chặn hoàn toàn quyền Thêm/Sửa/Xóa của Staff (trả về lỗi 403 như thiết kế nếu cố tình thao tác).
- **Kết quả**: Khắc phục hoàn toàn lỗi hiển thị bảng và lỗi 403 Forbidden của Nhân viên khi vào mục hóa đơn/áp dụng voucher.

### 25/06/2026 11:05 — Sửa Lỗi Phân Quyền API Khách Hàng (Customers) Cho Nhân Viên (Staff)
- **Loại**: Sửa bug / Chỉnh sửa phân quyền
- **File**: `BE/src/routes/customers.js`
- **Mô tả**: Thay đổi phân quyền của route lấy danh sách khách hàng `GET /api/customers` và lịch sử đơn hàng của khách hàng `GET /api/customers/:id/orders` từ `authorize('admin')` sang `authorize('admin', 'staff')`. Điều này cho phép Nhân viên (Staff) có quyền tìm kiếm số điện thoại khách hàng thành viên và xem lịch sử tích lũy tại POS mà không bị lỗi chặn 403 Forbidden.
- **Kết quả**: Giải quyết triệt để lỗi 403 khi tìm kiếm/áp dụng thông tin khách hàng ở POS của vai trò Staff.

### 25/06/2026 13:40 — Nâng Cấp Xuất Excel, Tăng Trưởng Dashboard Động & Đồng Bộ Hover Bóng Đổ Card
- **Loại**: Cải thiện UI UX / Tính năng mới / Sửa bug
- **File**: `BE/src/utils/exportExcel.js`, `BE/src/controllers/dashboardController.js`, `FE/assets/js/views/dashboard.js`, `FE/assets/css/dashboard.css`, `FE/assets/css/main.css`
- **Mô tả**:
  1. **Xuất Excel**:
     - Bỏ màu Header màu mè, đưa về mặc định trơn của Excel (chỉ in đậm Row 1).
     - Thiết lập Auto-Filter cho toàn bộ các cột trên tất cả Sheet báo cáo.
     - Cấu hình định dạng số tiền tệ chuẩn hiển thị `#,##0" VNĐ"` cho toàn bộ các cột liên quan đến tiền.
     - Chuyển đổi dữ liệu ngày tháng sang đối tượng Date thực tế và gán định dạng `dd/mm/yyyy` giúp Excel lọc ngày tháng dễ dàng.
  2. **Tăng trưởng Dashboard Động (SQL)**:
     - Viết các câu lệnh SQL ở Backend truy vấn dữ liệu hôm qua / kỳ trước để tính toán chính xác % tăng trưởng động thay vì mock cứng ở Frontend.
     - Đồng bộ 4 Stat Card của Dashboard luôn có kích thước đều nhau hoàn hảo bằng CSS Grid `align-items: stretch` và `height: 100%`.
     - Thêm trình lắng nghe sự kiện Click vào Stat Card để tự động điều hướng sang Tab liên quan (Doanh thu -> Báo cáo, Tổng đơn -> Hóa đơn, Trung bình -> Hóa đơn, Khách mới -> Khách hàng).
  3. **Đồng Bộ Hover Bóng Đổ Card**:
     - Bổ sung quy tắc CSS chung ở `main.css` gán cho toàn bộ các Card của hệ thống (`.user-card`, `.voucher-card`, `.product-card`, `.table-card`, `.card`, `.stat-card`) có viền bo góc tròn mịn (`12px`) và hiệu ứng hover nổi lên (`translateY(-5px)`) kèm đổ bóng nổi bật, sang trọng.
- **Kết quả**: Thành công. Ứng dụng trông cực kỳ cao cấp, dữ liệu dashboard khớp tuyệt đối và file Excel được xuất ra chuẩn hóa.

### 25/06/2026 13:50 — Ẩn Nút Hủy Ngoài Bảng Hóa Đơn & Thêm Bộ Lọc Biểu Đồ Doanh Thu
- **Loại**: Cải thiện UI UX / Tính năng mới
- **File**: `FE/assets/js/views/invoices.js`, `FE/assets/js/views/reports.js`
- **Mô tả**:
  1. **Hóa đơn**: Ẩn hoàn toàn nút "Hủy" hiển thị tại cột thao tác của bảng danh sách hóa đơn bên ngoài. Nút "Hủy hóa đơn" sẽ chỉ xuất hiện khi người dùng click vào "Chi tiết" để mở modal xem thông tin cụ thể của hóa đơn đó.
  2. **Bộ lọc biểu đồ**: Thêm một ô chọn (Select dropdown) bo góc tinh tế bên cạnh tiêu đề biểu đồ Doanh thu (ở Tab Doanh thu của trang Báo cáo) cho phép lựa chọn xem theo: `7 ngày qua`, `30 ngày qua` và `12 tháng qua`. Việc chuyển đổi thời gian sẽ tự động tính toán, gộp doanh thu theo ngày/tháng tương ứng và vẽ lại biểu đồ Chart.js ngay lập tức ở frontend mà không cần gọi lại API.
- **Kết quả**: Thành công. Trải nghiệm nghiệp vụ hóa đơn gọn gàng, bộ lọc biểu đồ phản hồi tức thì và thuận tiện hơn cho người quản trị.

### 25/06/2026 14:05 — Sửa Chớp Đen Màn Hình, Lọc Biểu Đồ Liên Tục & Giới Hạn Chiều Cao POS Layout
- **Loại**: Sửa bug / Cải thiện UI UX
- **File**: `FE/assets/js/router.js`, `FE/assets/css/pos.css`, `FE/assets/js/views/reports.js`
- **Mô tả**:
  1. **Chớp đen màn hình**: Sửa đổi cơ chế nạp trang trong `router.js` để chỉ gọi `Sidebar.render()` khi sidebar chưa được dựng lên (lần đầu đăng nhập). Việc chuyển tab giờ đây chỉ cập nhật class active bằng `Sidebar.updateActive()`, giúp loại bỏ hoàn toàn hiện tượng chớp đen khi di chuyển giữa các view.
  2. **Tràn menu POS**: Cấu hình giới hạn chiều cao tối đa cho `.pos-layout` trong `pos.css` theo chiều cao viewport (`calc(100vh - 32px)`). Điều này cho phép danh sách món ăn ở panel bên trái tự động kích hoạt thanh cuộn dọc (scroll-y) mượt mà khi menu quá dài, không bị đè lấn hình ảnh hay các phần tử giỏ hàng.
  3. **Lấp đầy dữ liệu trống ở Biểu đồ**: Sửa đổi logic `updateRevenueChart` trong `reports.js` để sinh ra chuỗi thời gian liên tục (7 ngày, 30 ngày, 12 tháng) lùi về trước từ ngày hôm nay. Nếu ngày/tháng nào trong database chưa có dữ liệu, biểu đồ tự động gán doanh thu bằng `0` thay vì nhảy cóc mốc thời gian, đảm bảo trục thời gian logic.
- **Kết quả**: Thành công. Ứng dụng chuyển tab siêu mượt không chớp, giao diện POS cuộn món trơn tru và biểu đồ hiển thị thời gian chuẩn xác.

### 25/06/2026 14:15 — Việt Hóa Nhật Ký Hoạt Động & Xuất Excel / PDF Động Theo Tab Hiện Tại
- **Loại**: Cải thiện UI UX / Tính năng mới / Sửa bug
- **File**: `BE/src/utils/exportExcel.js`, `BE/src/controllers/reportController.js`, `FE/assets/js/views/reports.js`
- **Mô tả**:
  1. **Nhật ký hoạt động (Logs)**:
     - Việt hóa toàn bộ các mã hành động hệ thống (ví dụ: `CREATE_ORDER` dịch thành `Tạo đơn hàng`, `UPDATE_USER` dịch thành `Cập nhật tài khoản`, v.v.) hiển thị trên bảng.
     - Cập nhật hàm format ngày tháng `fmtDate` thay thế khoảng trắng bằng chữ `T` giúp JavaScript parse ngày tháng an toàn trên tất cả các trình duyệt di động/máy tính, định dạng chuẩn `dd/mm/yyyy hh:mm` cho thời gian nhật ký.
  2. **Xuất báo cáo Excel / PDF theo Tab**:
     - Thay đổi nút xuất báo cáo Excel/PDF từ link tĩnh sang nút bấm gọi API kèm tham số `?tab=${activeTab}` ở frontend `reports.js`.
     - Backend (`reportController.js` và `exportExcel.js`) sẽ tiếp nhận tham số `tab` này để chỉ xuất duy nhất 1 Sheet dữ liệu tương ứng với Tab đang đứng (Ví dụ: Đang ở tab Khuyến mãi thì file tải về là `bao_cao_khuyen_mai.xlsx` và chỉ chứa duy nhất Sheet Khuyến mãi), đảm bảo sạch sẽ và đúng nhu cầu của quản trị viên.
     - Bổ sung Sheet `Nhật ký` và tính năng xuất Excel riêng cho nhật ký hoạt động.
- **Kết quả**: Thành công. Dữ liệu nhật ký rõ ràng bằng tiếng Việt, định dạng ngày tháng chuẩn xác và tính năng xuất Excel/PDF hoạt động hoàn hảo theo từng Tab.
### 25/06/2026 14:36 — Thêm Nút Xuất Excel Cho Sản Phẩm, Khách Hàng, Hóa Đơn & Đổi Input Ngày Modal Phân Ca
- **Loại**: Tính năng mới / Cải thiện UI UX
- **File**: `BE/src/controllers/reportController.js`, `BE/src/utils/exportExcel.js`, `FE/assets/js/views/products.js`, `FE/assets/js/views/customers.js`, `FE/assets/js/views/invoices.js`, `FE/assets/js/views/shifts.js`
- **Mô tả**:
  1. **Xuất Excel cho Sản phẩm, Khách hàng & Hóa đơn**:
     - Backend: Bổ sung xử lý xuất Excel cho tab `invoices` tại `reportController.js`, hỗ trợ nhận các tham số lọc (`date_from`, `date_to`, `status`, `search`) giống như trên giao diện danh sách. Thêm sheet `Hóa đơn` tại `exportExcel.js` định dạng cột tiền tệ VNĐ, ngày tháng `dd/mm/yyyy hh:mm:ss`, dịch các phương thức thanh toán và trạng thái sang Tiếng Việt.
     - Frontend: Thêm nút **Xuất Excel** và gắn trình xử lý sự kiện tải file tương ứng tại các view `products.js`, `customers.js`, `invoices.js`. Đối với màn hình Hóa đơn, tự động truyền thêm các tham số bộ lọc hiện tại của người dùng để xuất dữ liệu chính xác theo những gì đang hiển thị.
  2. **Đổi Input Ngày tại Modal Phân Ca**:
     - Thay thế `<input type="date">` mặc định bằng `<input type="text" placeholder="dd/mm/yyyy">` trong Modal "Phân ca làm việc mới" ở `shifts.js`.
     - Áp dụng bộ lọc mask tự động định dạng và điền dấu gạch chéo `/` khi người dùng nhập số.
     - Xử lý kiểm tra ngày nhập hợp lệ và parse ngược lại định dạng `yyyy-mm-dd` trước khi gọi API `POST /api/shifts` lên backend.
- **Kết quả**: Thành công. Tiết kiệm thời gian quản trị, file Excel xuất ra đầy đủ, giao diện modal phân ca đẹp mắt và thân thiện hơn.

### 25/06/2026 14:48 — Nâng Cấp Vùng Tải Lên Ảnh Sản Phẩm Thành Kéo Thả (Drag & Drop Zone)
- **Loại**: Cải thiện UI UX / Tính năng mới
- **File**: `FE/assets/css/main.css`, `FE/assets/js/views/products.js`
- **Mô tả**:
  1. **CSS main.css**: Thêm quy tắc kiểu dáng cho lớp `.image-upload-zone` (nét đứt viền dashed, bo góc rộng, đổi nền sang màu xanh nhạt oải hương và viền đổi màu chủ đạo khi hover/dragover).
  2. **Javascript products.js**: Chuyển đổi input chọn ảnh truyền thống của form thêm/sửa sản phẩm sang vùng kéo thả trực quan. Đăng ký các sự kiện Drag/Drop (`dragover`, `dragleave`, `drop`) và tự động đọc dữ liệu File qua `FileReader` để hiển thị ảnh xem trước ngay khi ảnh được thả vào vùng upload.
- **Kết quả**: Thành công. Form điền sản phẩm trông cực kỳ chuyên nghiệp và nâng cao trải nghiệm tải tài nguyên đáng kể.

### 25/06/2026 14:50 — Đồng Bộ Vùng Tải Lên Ảnh Kéo Thả (Drag & Drop) Cho Khách Hàng Và Nhân Viên
- **Loại**: Cải thiện UI UX / Tính năng mới
- **File**: `FE/assets/js/views/customers.js`, `FE/assets/js/views/users.js`
- **Mô tả**:
  - Quét toàn bộ hệ thống tìm kiếm input upload file (`type="file"`) và thực hiện đồng bộ hóa toàn bộ sang vùng kéo thả `image-upload-zone` chuyên nghiệp.
  - Cập nhật cả 2 form thêm và sửa của Khách hàng (`customers.js`) cũng như Nhân viên (`users.js`) hỗ trợ hiển thị preview tròn, bo góc và bắt các sự kiện kéo thả file chuẩn xác.
- **Kết quả**: Thành công. Toàn bộ các form tải ảnh lên trong hệ thống đã được đồng bộ chuẩn UI/UX kéo thả hiện đại.

### 25/06/2026 15:08 — Nâng Cấp Kích Thước Modals & Tích Hợp Đếm Ngược 5 Phút QR PayOS
- **Loại**: Cải thiện UI UX / Tính năng mới
- **File**: `FE/assets/js/views/vouchers.js`, `FE/assets/js/views/products.js`, `FE/assets/js/views/users.js`, `FE/assets/js/views/pos.js`
- **Mô tả**:
  1. **Nâng cấp Kích thước Modals**:
     - Cấu hình kích thước rộng rãi hơn `size: 'lg'` cho tất cả các modal liên quan đến Vouchers (Modal chi tiết, danh sách lịch sử sử dụng, form thêm mới và chỉnh sửa) để không còn bị bó hẹp và tránh tình trạng phải dùng thanh cuộn dọc.
     - Áp dụng tương tự cho các modal form chứa nhiều trường dữ liệu như sản phẩm (`products.js`) và tài khoản nhân viên (`users.js`).
  2. **Đếm ngược 5 phút QR PayOS**:
     - Thêm phần tử hiển thị bộ đếm ngược thời gian từ 5 phút (300 giây) trên Modal quét mã QR thanh toán PayOS.
     - Khi đếm ngược kết thúc (`00:00`), tự động đóng Modal và xóa bỏ đơn hàng khỏi cơ sở dữ liệu để giải phóng giỏ hàng/bàn ăn bị treo. Dọn dẹp các timers khi kết thúc giao dịch.
- **Kết quả**: Thành công. Không gian modal thoải mái trực quan, giao dịch thanh toán QR có thời hạn rõ ràng hạn chế đơn rác.
