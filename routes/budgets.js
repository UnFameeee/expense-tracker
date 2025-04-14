const express = require('express');
const router = express.Router();
const Budget = require('../models/budget');
const Expense = require('../models/expense');
const Income = require('../models/income');

// GET trang quản lý ngân sách
router.get('/', async (req, res) => {
  try {
    const budgets = await Budget.getAll();
    res.render('budgets/index', { 
      budgets,
      title: 'Quản lý ngân sách' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Lỗi khi lấy dữ liệu ngân sách' });
  }
});

// GET form tạo ngân sách mới
router.get('/new', async (req, res) => {
  try {
    // Lấy danh sách các danh mục chi tiêu để thiết lập giới hạn
    const [categoryRows] = await require('../config/database').query(
      'SELECT DISTINCT category FROM expenses ORDER BY category'
    );
    const categories = categoryRows.map(row => row.category);
    
    // Lấy tháng và năm hiện tại
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    res.render('budgets/new', { 
      categories, 
      currentMonth, 
      currentYear,
      title: 'Tạo ngân sách mới' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Lỗi khi chuẩn bị form tạo ngân sách' });
  }
});

// POST tạo ngân sách mới
router.post('/', async (req, res) => {
  try {
    const { base_salary, month, year, savings_goal } = req.body;
    
    // Xử lý giới hạn chi tiêu theo danh mục
    const categoryLimits = {};
    Object.keys(req.body).forEach(key => {
      if (key.startsWith('limit_')) {
        const category = key.replace('limit_', '');
        categoryLimits[category] = parseFloat(req.body[key]) || 0;
      }
    });
    
    await Budget.create({
      base_salary,
      month,
      year,
      savings_goal,
      category_limits: categoryLimits
    });
    
    res.redirect('/budgets');
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Lỗi khi tạo ngân sách mới' });
  }
});

// GET form chỉnh sửa ngân sách
router.get('/:id/edit', async (req, res) => {
  try {
    const budget = await Budget.getById(req.params.id);
    if (!budget) {
      return res.status(404).render('error', { message: 'Không tìm thấy ngân sách' });
    }
    
    // Lấy danh sách các danh mục chi tiêu
    const [categoryRows] = await require('../config/database').query(
      'SELECT DISTINCT category FROM expenses ORDER BY category'
    );
    const categories = categoryRows.map(row => row.category);
    
    // Parse category limits từ JSON string
    budget.category_limits = JSON.parse(budget.category_limits || '{}');
    
    res.render('budgets/edit', { 
      budget, 
      categories,
      title: 'Chỉnh sửa ngân sách' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Lỗi khi lấy dữ liệu ngân sách' });
  }
});

// PUT cập nhật ngân sách
router.put('/:id', async (req, res) => {
  try {
    const { base_salary, month, year, savings_goal } = req.body;
    
    // Xử lý giới hạn chi tiêu theo danh mục
    const categoryLimits = {};
    Object.keys(req.body).forEach(key => {
      if (key.startsWith('limit_')) {
        const category = key.replace('limit_', '');
        categoryLimits[category] = parseFloat(req.body[key]) || 0;
      }
    });
    
    await Budget.update(req.params.id, {
      base_salary,
      month,
      year,
      savings_goal,
      category_limits: categoryLimits
    });
    
    res.redirect('/budgets');
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Lỗi khi cập nhật ngân sách' });
  }
});

// DELETE xóa ngân sách
router.delete('/:id', async (req, res) => {
  try {
    await Budget.delete(req.params.id);
    res.redirect('/budgets');
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Lỗi khi xóa ngân sách' });
  }
});

// GET trang dự báo chi tiêu
router.get('/forecast', async (req, res) => {
  try {
    // Lấy ngân sách hiện tại
    const currentBudget = await Budget.getCurrent();
    
    // Tính toán số tiền còn lại có thể chi tiêu
    const remainingBudget = await Budget.calculateRemainingBudget();
    
    // Dự báo chi tiêu dựa trên lịch sử
    const forecast = await Budget.forecastExpenses();
    
    res.render('budgets/forecast', { 
      currentBudget,
      remainingBudget,
      forecast,
      title: 'Dự báo chi tiêu' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Lỗi khi tạo dự báo chi tiêu' });
  }
});

module.exports = router;
