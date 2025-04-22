const express = require('express');
const router = express.Router();
const { getAllExpenses, addExpense } = require('../../services/expenseService');

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
  const { amount, description, date } = req.body;
  if (!amount || !description || !date) {
    return res.status(400).json({ error: 'Thiếu thông tin!' });
  }
  try {
    await addExpense({ amount, description, date, username: req.user.username });
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi lưu dữ liệu vào MySQL' });
  }
});

module.exports = router;
