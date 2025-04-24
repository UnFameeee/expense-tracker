const express = require('express');
const router = express.Router();
const ejs = require('ejs');
const path = require('path');

// Helper render layout
function renderWithLayout(res, view, options = {}) {
  ejs.renderFile(
    path.join(__dirname, '../views', view + '.ejs'),
    options,
    (err, str) => {
      if (err) return res.status(500).send('Lỗi render view');
      ejs.renderFile(
        path.join(__dirname, '../views', 'layout.ejs'),
        { ...options, body: str },
        (err2, html) => {
          if (err2) return res.status(500).send('Lỗi render layout');
          res.send(html);
        }
      );
    }
  );
}

// Landing page
router.get('/', (req, res) => {
  renderWithLayout(res, 'landing', { title: 'Expense Tracker', user: null });
});

// Login page
router.get('/login', (req, res) => {
  renderWithLayout(res, 'login', { title: 'Đăng nhập', user: null });
});

// Register page
router.get('/register', (req, res) => {
  renderWithLayout(res, 'register', { title: 'Đăng ký', user: null });
});

// Dashboard page (frontend sẽ kiểm tra JWT)
router.get('/dashboard', (req, res) => {
  renderWithLayout(res, 'dashboard', { title: 'Dashboard', user: null });
});

module.exports = router;
