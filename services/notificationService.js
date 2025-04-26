const nodemailer = require('nodemailer');
require('dotenv').config();

// Cấu hình transporter cho nodemailer sử dụng biến môi trường
let transporter = null;

// Khởi tạo transporter tự động khi import module
initializeTransporter();

function initializeTransporter() {
  // Luôn dùng thông tin SMTP từ biến môi trường
  const email = process.env.SMTP_USER;
  const password = process.env.SMTP_PASS;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const secure = port === 465; // true for 465, false for other ports

  if (!email || !password) {
    console.warn('Thông tin email hoặc mật khẩu SMTP không được cấu hình trong .env');
    return false;
  }

  transporter = nodemailer.createTransport({
    host: host,
    port: port,
    secure: secure,
    auth: {
      user: email,
      pass: password
    }
  });
  
  // Kiểm tra kết nối
  return transporter.verify()
    .then(() => {
      console.log('Kết nối SMTP thành công');
      return true;
    })
    .catch(err => {
      console.error('Lỗi khi kết nối SMTP:', err);
      return false;
    });
}

/**
 * Gửi email thông báo
 * @param {Object} options - Tùy chọn email
 * @param {string} options.to - Địa chỉ email người nhận
 * @param {string} options.subject - Tiêu đề email
 * @param {string} options.text - Nội dung dạng text
 * @param {string} options.html - Nội dung dạng HTML (optional)
 */
async function sendEmail(options) {
  if (!transporter) {
    throw new Error('Chưa khởi tạo transporter email');
  }
  // Đặt tên hiển thị cho email gửi đi là 'Expense Tracker'
  const fromName = process.env.SMTP_FROM_NAME || 'Expense Tracker';
  const fromAddress = process.env.SMTP_USER;
  return transporter.sendMail({
    from: `"${fromName}" <${fromAddress}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  });
}

/**
 * Gửi thông báo vượt ngân sách
 * @param {Object} data - Dữ liệu ngân sách
 */
async function sendBudgetAlert(data) {
  const { userEmail, budgetName, budgetAmount, currentSpent, percentage } = data;
  
  const subject = `Cảnh báo: Bạn đã sử dụng ${percentage}% ngân sách ${budgetName}`;
  
  const text = `
    Xin chào,
    
    Hệ thống Expense Tracker thông báo bạn đã sử dụng ${percentage}% ngân sách "${budgetName}".
    
    Chi tiết:
    - Ngân sách: ${budgetName}
    - Hạn mức: ${formatCurrency(budgetAmount)}
    - Đã chi tiêu: ${formatCurrency(currentSpent)}
    - Còn lại: ${formatCurrency(budgetAmount - currentSpent)}
    
    Hãy kiểm soát chi tiêu để không vượt quá ngân sách đã định.
    
    Trân trọng,
    Expense Tracker
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #d9534f;">Cảnh báo ngân sách</h2>
      <p>Xin chào,</p>
      <p>Hệ thống Expense Tracker thông báo bạn đã sử dụng <strong style="color: ${percentage > 90 ? '#d9534f' : '#f0ad4e'};">${percentage}%</strong> ngân sách "<strong>${budgetName}</strong>".</p>
      
      <div style="background-color: #f8f9fa; border-radius: 5px; padding: 15px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Chi tiết ngân sách:</h3>
        <table style="width: 100%;">
          <tr>
            <td style="padding: 8px 0;">Ngân sách:</td>
            <td style="font-weight: bold; text-align: right;">${budgetName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;">Hạn mức:</td>
            <td style="font-weight: bold; text-align: right;">${formatCurrency(budgetAmount)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;">Đã chi tiêu:</td>
            <td style="font-weight: bold; text-align: right; color: #d9534f;">${formatCurrency(currentSpent)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;">Còn lại:</td>
            <td style="font-weight: bold; text-align: right; color: #5cb85c;">${formatCurrency(budgetAmount - currentSpent)}</td>
          </tr>
        </table>
        
        <div style="margin-top: 15px;">
          <div style="background-color: #e9ecef; border-radius: 5px; height: 20px; width: 100%;">
            <div 
              style="background-color: ${percentage > 90 ? '#d9534f' : percentage > 75 ? '#f0ad4e' : '#5cb85c'}; 
                     height: 100%; 
                     width: ${percentage}%; 
                     border-radius: 5px;"
            ></div>
          </div>
          <div style="text-align: right; font-size: 12px; margin-top: 5px;">${percentage}%</div>
        </div>
      </div>
      
      <p>Hãy kiểm soát chi tiêu để không vượt quá ngân sách đã định.</p>
      <p>Trân trọng,<br>Expense Tracker</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 12px; color: #6c757d;">
        <p>Email này được gửi tự động. Vui lòng không trả lời.</p>
        <p>Để quản lý cài đặt thông báo, vui lòng đăng nhập vào tài khoản của bạn.</p>
      </div>
    </div>
  `;
  
  return sendEmail({
    to: userEmail,
    subject,
    text,
    html
  });
}

/**
 * Gửi báo cáo định kỳ
 * @param {Object} data - Dữ liệu báo cáo
 */
async function sendPeriodicReport(data) {
  const { userEmail, period, totalIncome, totalExpense, balance, topExpenses, topCategories } = data;
  
  const subject = `Báo cáo tài chính ${formatPeriod(period)}`;
  
  const text = `
    Xin chào,
    
    Dưới đây là báo cáo tài chính ${formatPeriod(period)} của bạn:
    
    TỔNG QUAN:
    - Thu nhập: ${formatCurrency(totalIncome)}
    - Chi tiêu: ${formatCurrency(totalExpense)}
    - Cân đối: ${formatCurrency(balance)} (${balance >= 0 ? 'Dương' : 'Âm'})
    
    CHI TIÊU NHIỀU NHẤT:
    ${topExpenses.map((expense, index) => `${index + 1}. ${expense.description}: ${formatCurrency(expense.amount)} (${formatDate(expense.date)})`).join('\n')}
    
    DANH MỤC CHI TIÊU NHIỀU NHẤT:
    ${topCategories.map((category, index) => `${index + 1}. ${category.name}: ${formatCurrency(category.amount)} (${category.percentage}% tổng chi tiêu)`).join('\n')}
    
    Để xem chi tiết đầy đủ, vui lòng đăng nhập vào ứng dụng Expense Tracker.
    
    Trân trọng,
    Expense Tracker
  `;
  
  // HTML version với định dạng đẹp hơn
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0275d8;">Báo cáo tài chính ${formatPeriod(period)}</h2>
      <p>Xin chào,</p>
      <p>Dưới đây là báo cáo tài chính của bạn:</p>
      
      <div style="background-color: #f8f9fa; border-radius: 5px; padding: 15px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Tổng quan tài chính:</h3>
        <table style="width: 100%;">
          <tr>
            <td style="padding: 8px 0;">Thu nhập:</td>
            <td style="font-weight: bold; text-align: right; color: #5cb85c;">${formatCurrency(totalIncome)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;">Chi tiêu:</td>
            <td style="font-weight: bold; text-align: right; color: #d9534f;">${formatCurrency(totalExpense)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;">Cân đối:</td>
            <td style="font-weight: bold; text-align: right; color: ${balance >= 0 ? '#5cb85c' : '#d9534f'};">${formatCurrency(balance)}</td>
          </tr>
        </table>
      </div>
      
      <div style="margin: 20px 0;">
        <h3>Chi tiêu lớn nhất:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 10px; text-align: left; border-bottom: 1px solid #dee2e6;">#</th>
            <th style="padding: 10px; text-align: left; border-bottom: 1px solid #dee2e6;">Mô tả</th>
            <th style="padding: 10px; text-align: right; border-bottom: 1px solid #dee2e6;">Số tiền</th>
            <th style="padding: 10px; text-align: right; border-bottom: 1px solid #dee2e6;">Ngày</th>
          </tr>
          ${topExpenses.map((expense, index) => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">${index + 1}</td>
              <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">${expense.description}</td>
              <td style="padding: 10px; text-align: right; border-bottom: 1px solid #dee2e6; font-weight: bold;">${formatCurrency(expense.amount)}</td>
              <td style="padding: 10px; text-align: right; border-bottom: 1px solid #dee2e6;">${formatDate(expense.date)}</td>
            </tr>
          `).join('')}
        </table>
      </div>
      
      <div style="margin: 20px 0;">
        <h3>Danh mục chi tiêu nhiều nhất:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 10px; text-align: left; border-bottom: 1px solid #dee2e6;">#</th>
            <th style="padding: 10px; text-align: left; border-bottom: 1px solid #dee2e6;">Danh mục</th>
            <th style="padding: 10px; text-align: right; border-bottom: 1px solid #dee2e6;">Số tiền</th>
            <th style="padding: 10px; text-align: right; border-bottom: 1px solid #dee2e6;">Tỷ lệ</th>
          </tr>
          ${topCategories.map((category, index) => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">${index + 1}</td>
              <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">${category.name}</td>
              <td style="padding: 10px; text-align: right; border-bottom: 1px solid #dee2e6; font-weight: bold;">${formatCurrency(category.amount)}</td>
              <td style="padding: 10px; text-align: right; border-bottom: 1px solid #dee2e6;">${category.percentage}%</td>
            </tr>
          `).join('')}
        </table>
      </div>
      
      <p>Để xem chi tiết đầy đủ, vui lòng <a href="#" style="color: #0275d8; text-decoration: none;">đăng nhập vào ứng dụng Expense Tracker</a>.</p>
      
      <p>Trân trọng,<br>Expense Tracker</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 12px; color: #6c757d;">
        <p>Email này được gửi tự động. Vui lòng không trả lời.</p>
        <p>Để quản lý cài đặt thông báo, vui lòng đăng nhập vào tài khoản của bạn.</p>
      </div>
    </div>
  `;
  
  return sendEmail({
    to: userEmail,
    subject,
    text,
    html
  });
}

// Helper functions
function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
}

function formatPeriod(period) {
  const periods = {
    'day': 'hôm nay',
    'week': 'tuần này',
    'month': 'tháng này',
    'year': 'năm nay'
  };
  return periods[period] || period;
}

module.exports = {
  initializeTransporter,
  sendEmail,
  sendBudgetAlert,
  sendPeriodicReport
};
