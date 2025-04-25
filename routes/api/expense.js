const express = require('express');
const router = express.Router();
const { getAllExpenses, addExpense, updateExpense, deleteExpense, getExpenseStatsByCategory } = require('../../services/expenseService');

// Middleware xác thực JWT (dùng lại từ app.js)
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

// GET /api/expenses
router.get('/', authMiddleware, async (req, res) => {
  try {
    const expenses = await getAllExpenses(req.user.username);
    res.json(expenses);
  } catch (err) {
    console.error('Lỗi khi lấy expenses:', err); // Log chi tiết lỗi
    res.status(500).json({ error: 'Lỗi lấy dữ liệu từ MySQL', details: err.message });
  }
});

// POST /api/expenses
router.post('/', authMiddleware, async (req, res) => {
  const { amount, description, date, categoryId } = req.body;
  
  // Validation
  const errors = {};
  
  if (!amount) {
    errors.amount = 'Số tiền không được để trống';
  } else if (isNaN(amount) || Number(amount) <= 0) {
    errors.amount = 'Số tiền phải là số dương';
  }
  
  if (!description) {
    errors.description = 'Nội dung không được để trống';
  } else if (description.length < 2) {
    errors.description = 'Nội dung phải có ít nhất 2 ký tự';
  }
  
  if (!date) {
    errors.date = 'Ngày không được để trống';
  } else {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      errors.date = 'Ngày không hợp lệ';
    }
  }
  
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }
  
  try {
    const newExpense = await addExpense({ amount, description, date, categoryId, username: req.user.username });
    res.status(201).json({ success: true, expense: newExpense });
  } catch (err) {
    console.error('Lỗi khi thêm expense:', err);
    res.status(500).json({ error: 'Lỗi lưu dữ liệu vào database', details: err.message });
  }
});

// PUT /api/expenses/:id - Cập nhật khoản chi tiết
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { amount, description, date, categoryId } = req.body;
  
  // Validation
  const errors = {};
  
  if (!amount) {
    errors.amount = 'Số tiền không được để trống';
  } else if (isNaN(amount) || Number(amount) <= 0) {
    errors.amount = 'Số tiền phải là số dương';
  }
  
  if (!description) {
    errors.description = 'Nội dung không được để trống';
  } else if (description.length < 2) {
    errors.description = 'Nội dung phải có ít nhất 2 ký tự';
  }
  
  if (!date) {
    errors.date = 'Ngày không được để trống';
  } else {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      errors.date = 'Ngày không hợp lệ';
    }
  }
  
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }
  
  try {
    const updatedExpense = await updateExpense(
      id, 
      { amount, description, date, categoryId }, 
      req.user.username
    );
    res.json({ success: true, expense: updatedExpense });
  } catch (err) {
    console.error('Lỗi khi cập nhật expense:', err);
    if (err.message.includes('không tồn tại')) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Lỗi cập nhật expense', details: err.message });
  }
});

// DELETE /api/expenses/:id - Xóa khoản chi tiết
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  
  try {
    await deleteExpense(id, req.user.username);
    res.json({ success: true, message: 'Đã xóa khoản chi tiết thành công' });
  } catch (err) {
    console.error('Lỗi khi xóa expense:', err);
    if (err.message.includes('không tồn tại')) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Lỗi xóa expense', details: err.message });
  }
});

// GET /api/expenses/stats - Lấy thống kê chi tiêu theo danh mục
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const { period } = req.query; // 'week', 'month', 'year'
    const stats = await getExpenseStatsByCategory(req.user.username, period);
    res.json(stats);
  } catch (err) {
    console.error('Lỗi khi lấy thống kê chi tiêu:', err);
    res.status(500).json({ error: 'Lỗi lấy dữ liệu thống kê', details: err.message });
  }
});

module.exports = router;
