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

// Helper render dashboard layout
function renderDashboardLayout(res, view, options = {}) {
  ejs.renderFile(
    path.join(__dirname, '../views', view + '.ejs'),
    options,
    (err, str) => {
      if (err) {
        console.error('Lỗi render view:', err);
        return res.status(500).send('Lỗi render view');
      }
      ejs.renderFile(
        path.join(__dirname, '../views', 'dashboard-layout.ejs'),
        { ...options, body: str, scripts: options.scripts || '' },
        (err2, html) => {
          if (err2) {
            console.error('Lỗi render dashboard layout:', err2);
            return res.status(500).send('Lỗi render layout');
          }
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

// Dashboard page - Trang tổng quan
router.get('/dashboard', (req, res) => {
  renderDashboardLayout(res, 'dashboard-overview', { 
    title: 'Tổng quan', 
    user: { username: 'user' }, // This will be replaced by actual user from JWT
    activePage: 'dashboard'
  });
});

// Expenses page - Quản lý chi tiêu
router.get('/expenses', (req, res) => {
  renderDashboardLayout(res, 'expenses', { 
    title: 'Quản lý chi tiêu', 
    user: { username: 'user' },
    activePage: 'expenses'
  });
});

// Incomes page - Quản lý thu nhập
router.get('/incomes', (req, res) => {
  renderDashboardLayout(res, 'incomes', { 
    title: 'Quản lý thu nhập', 
    user: { username: 'user' },
    activePage: 'incomes'
  });
});

// Budgets page - Quản lý ngân sách
router.get('/budgets', (req, res) => {
  renderDashboardLayout(res, 'budgets', { 
    title: 'Quản lý ngân sách', 
    user: { username: 'user' },
    activePage: 'budgets'
  });
});

// Categories page - Quản lý danh mục
router.get('/categories', (req, res) => {
  renderDashboardLayout(res, 'categories', { 
    title: 'Quản lý danh mục', 
    user: { username: 'user' },
    activePage: 'categories'
  });
});

// Reports page - Báo cáo thống kê
router.get('/reports', (req, res) => {
  renderDashboardLayout(res, 'reports', { 
    title: 'Báo cáo thống kê', 
    user: { username: 'user' },
    activePage: 'reports'
  });
});

// Settings page - Cài đặt tài khoản
router.get('/settings', (req, res) => {
  renderDashboardLayout(res, 'settings', { 
    title: 'Cài đặt tài khoản', 
    user: { username: 'user' },
    activePage: 'settings'
  });
});

module.exports = router;
