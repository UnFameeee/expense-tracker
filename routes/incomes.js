const express = require('express');
const router = express.Router();
const Income = require('../models/income');

// GET danh sách thu nhập
router.get('/', async (req, res) => {
  try {
    const incomes = await Income.getAll();
    
    // Tính tổng thu nhập
    const total = incomes.reduce((sum, income) => sum + parseFloat(income.amount), 0);
    
    res.render('incomes/index', { 
      incomes, 
      total: total.toFixed(2),
      title: 'Quản lý thu nhập' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Lỗi khi lấy dữ liệu thu nhập' });
  }
});

// GET form tạo thu nhập mới
router.get('/new', (req, res) => {
  res.render('incomes/new', { title: 'Thêm thu nhập mới' });
});

// POST tạo thu nhập mới
router.post('/', async (req, res) => {
  try {
    await Income.create(req.body);
    res.redirect('/incomes');
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Lỗi khi tạo thu nhập mới' });
  }
});

// GET form chỉnh sửa thu nhập
router.get('/:id/edit', async (req, res) => {
  try {
    const income = await Income.getById(req.params.id);
    if (!income) {
      return res.status(404).render('error', { message: 'Không tìm thấy thu nhập' });
    }
    res.render('incomes/edit', { income, title: 'Chỉnh sửa thu nhập' });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Lỗi khi lấy dữ liệu thu nhập' });
  }
});

// PUT cập nhật thu nhập
router.put('/:id', async (req, res) => {
  try {
    await Income.update(req.params.id, req.body);
    res.redirect('/incomes');
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Lỗi khi cập nhật thu nhập' });
  }
});

// DELETE xóa thu nhập
router.delete('/:id', async (req, res) => {
  try {
    await Income.delete(req.params.id);
    res.redirect('/incomes');
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Lỗi khi xóa thu nhập' });
  }
});

module.exports = router;
