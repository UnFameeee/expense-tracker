# Kế hoạch phát triển Expense Tracker App

## 1. Hiện trạng ứng dụng

### 1.1. Tổng quan
- **Tên ứng dụng**: Expense Tracker
- **Mô tả**: Ứng dụng theo dõi chi tiêu cá nhân giúp người dùng ghi lại và quản lý các khoản chi tiêu hàng ngày
- **Công nghệ hiện tại**: Node.js, Express, EJS, Prisma, JWT, Bootstrap

### 1.2. Tính năng hiện có
- Đăng nhập/Đăng xuất
- Thêm khoản chi tiêu
- Xem danh sách chi tiêu
- Tính tổng chi tiêu

### 1.3. Hạn chế hiện tại
- Chưa có đăng ký tài khoản
- Chưa có chức năng xóa/sửa chi tiêu
- Chưa phân loại chi tiêu theo danh mục
- Giao diện cần cải thiện thêm
- Chưa có biểu đồ thống kê
- Chưa có tối ưu performance

---

## 2. Kế hoạch phát triển

### 2.1. Backend Enhancement
- [ ] Thêm API đăng ký tài khoản
- [ ] Thêm API xóa chi tiêu
- [ ] Thêm API cập nhật chi tiêu
- [ ] Thêm validation dữ liệu chặt chẽ hơn
- [ ] Thêm error handling

### 2.2. Frontend Enhancement
- [ ] Thêm trang đăng ký
- [ ] Cải thiện form thêm chi tiêu với validation
- [ ] Thêm chức năng xóa chi tiêu
- [ ] Thêm chức năng sửa chi tiêu
- [ ] Responsive design cho mobile

### 2.3. Phát triển tính năng nâng cao

#### a. Phân loại chi tiêu
- [ ] Thêm model Category trong database
- [ ] Thêm API quản lý category
- [ ] Cập nhật UI để chọn category khi thêm chi tiêu
- [ ] Thêm filter chi tiêu theo category

#### b. Thống kê và báo cáo
- [ ] Thêm API thống kê chi tiêu theo ngày/tuần/tháng
- [ ] Tích hợp Chart.js để hiển thị biểu đồ
- [ ] Thêm trang báo cáo chi tiêu
- [ ] Export báo cáo (PDF, CSV)

#### c. Các tính năng trọng yếu cần bổ sung
- [ ] **Quản lý ngân sách**: Đặt giới hạn ngân sách, cảnh báo vượt quá
- [ ] **Theo dõi thu nhập**: Ghi nhận thu nhập, tính toán tiết kiệm
- [ ] **Giao dịch định kỳ**: Hỗ trợ chi tiêu lặp lại (hóa đơn hàng tháng)
- [ ] **Thông báo và nhắc nhở**: Web/email notifications
- [ ] **Báo cáo nâng cao**: Biểu đồ nâng cao, export dữ liệu

### 2.4. Tính năng mở rộng / Advanced Features

#### a. Tính năng mang tính ưu tiên cao
- **Quản lý thu nhập**: Nhiều nguồn, phân loại, báo cáo thu nhập
- **Hỗ trợ nhiều loại tiền tệ**: Chọn loại tiền, cập nhật tỷ giá tự động
- **Đặt mục tiêu tài chính**: Tiết kiệm, thanh toán nợ, ngân sách cá nhân
- **Giao dịch định kỳ & nhắc nhở**: Tự động hóa, nhắc nhở thanh toán
- **Đồng bộ & backup dữ liệu**: Đăng nhập Google/Apple, đa thiết bị, backup
- **Chia sẻ & quản lý chi tiêu nhóm/gia đình**: Nhóm chi tiêu, ngân sách nhóm
- **Tìm kiếm & lọc thông minh**: Theo từ khóa, số tiền, thời gian, category
- **Phân tích nâng cao & báo cáo trực quan**: Biểu đồ so sánh, cảnh báo bất thường

#### b. Tính năng mang tính ưu tiên thấp
- **Tích hợp ngân hàng hoặc file sao kê**: Import CSV/Excel, API ngân hàng
- **Bảo mật & quyền riêng tư**: 2FA, PIN/FaceID/TouchID
- **Tùy biến giao diện**: Theme, dark mode, widget mobile
- **Hỗ trợ đa ngôn ngữ**: Tiếng Việt, tiếng Anh, v.v.

---

## 3. Tối ưu hiệu suất & Bảo mật

### 3.1. Tối ưu hiệu suất
- [ ] Caching với Redis cho các API được gọi thường xuyên
- [ ] Tối ưu database queries
- [ ] Minify và bundle frontend assets
- [ ] Lazy loading components

### 3.2. Bảo mật
- [ ] Security audit
- [ ] Implement rate limiting
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Helmet integration