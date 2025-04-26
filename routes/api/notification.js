const express = require('express');
const router = express.Router();
const notificationService = require('../../services/notificationService');

// Middleware xác thực JWT
const jwt = require('jsonwebtoken');
const SECRET = process.env.SECRET || 'expense_secret_key';

function authMiddleware(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth) return res.status(401).json({ error: 'Chưa đăng nhập' });
  const token = auth.split(' ')[1];
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(401).json({ error: 'Token không hợp lệ' });
    req.user = user;
    next();
  });
}

// Khởi tạo cấu hình email - Cần gửi khi khởi động ứng dụng
// POST /api/notifications/setup
router.post('/setup', authMiddleware, async (req, res) => {
  // Chỉ admin mới có quyền thiết lập
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Không có quyền thực hiện thao tác này' });
  }
  
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Thiếu thông tin email hoặc mật khẩu' });
  }
  
  try {
    const success = await notificationService.initializeTransporter({ email, password });
    if (success) {
      res.json({ success: true, message: 'Cấu hình email thành công' });
    } else {
      res.status(500).json({ error: 'Cấu hình email thất bại' });
    }
  } catch (err) {
    console.error('Lỗi khi thiết lập email:', err);
    res.status(500).json({ error: 'Lỗi khi thiết lập email', details: err.message });
  }
});

// Gửi thông báo vượt ngân sách
// POST /api/notifications/budget-alert
router.post('/budget-alert', authMiddleware, async (req, res) => {
  const { userEmail, budgetName, budgetAmount, currentSpent, percentage } = req.body;
  
  if (!userEmail || !budgetName || !budgetAmount || !currentSpent || !percentage) {
    return res.status(400).json({ error: 'Thiếu thông tin cần thiết' });
  }
  
  try {
    const result = await notificationService.sendBudgetAlert({
      userEmail,
      budgetName,
      budgetAmount,
      currentSpent,
      percentage
    });
    
    res.json({
      success: true,
      message: 'Đã gửi thông báo thành công',
      messageId: result.messageId
    });
  } catch (err) {
    console.error('Lỗi khi gửi thông báo:', err);
    res.status(500).json({ error: 'Lỗi khi gửi thông báo', details: err.message });
  }
});

// Gửi báo cáo định kỳ
// POST /api/notifications/report
router.post('/report', authMiddleware, async (req, res) => {
  const { userEmail, period, totalIncome, totalExpense, balance, topExpenses, topCategories } = req.body;
  
  if (!userEmail || !period) {
    return res.status(400).json({ error: 'Thiếu thông tin cần thiết' });
  }
  
  try {
    const result = await notificationService.sendPeriodicReport({
      userEmail,
      period,
      totalIncome,
      totalExpense,
      balance,
      topExpenses: topExpenses || [],
      topCategories: topCategories || []
    });
    
    res.json({
      success: true,
      message: 'Đã gửi báo cáo thành công',
      messageId: result.messageId
    });
  } catch (err) {
    console.error('Lỗi khi gửi báo cáo:', err);
    res.status(500).json({ error: 'Lỗi khi gửi báo cáo', details: err.message });
  }
});

// Gửi thông báo tuỳ chỉnh
// POST /api/notifications/custom
router.post('/custom', authMiddleware, async (req, res) => {
  const { to, subject, text, html } = req.body;
  
  if (!to || !subject || (!text && !html)) {
    return res.status(400).json({ error: 'Thiếu thông tin gửi email' });
  }
  
  try {
    const result = await notificationService.sendEmail({ to, subject, text, html });
    
    res.json({
      success: true,
      message: 'Đã gửi email thành công',
      messageId: result.messageId
    });
  } catch (err) {
    console.error('Lỗi khi gửi email:', err);
    res.status(500).json({ error: 'Lỗi khi gửi email', details: err.message });
  }
});

module.exports = router;
