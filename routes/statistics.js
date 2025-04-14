const express = require('express');
const router = express.Router();
const Expense = require('../models/expense');
const Income = require('../models/income');

// Trang tổng quan thống kê
router.get('/', async (req, res) => {
  try {
    // Lấy tổng chi tiêu theo các khoảng thời gian
    const dailyTotal = await Expense.getTotalExpenses('day');
    const weeklyTotal = await Expense.getTotalExpenses('week');
    const monthlyTotal = await Expense.getTotalExpenses('month');
    const yearlyTotal = await Expense.getTotalExpenses('year');
    
    // Lấy các khoản chi tiêu gần đây
    const recentExpenses = await Expense.getAll();
    
    // Lấy chi tiêu theo danh mục trong tháng
    const categoryTotals = await Expense.getCategoryTotals('month');
    
    // Tạo dữ liệu cho biểu đồ
    const chartData = {
      labels: ['Ngày', 'Tuần', 'Tháng', 'Năm'],
      datasets: [{
        label: 'Chi tiêu',
        data: [dailyTotal, weeklyTotal, monthlyTotal, yearlyTotal],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1
      }]
    };
    
    res.render('statistics/index', { 
      dailyTotal,
      weeklyTotal,
      monthlyTotal,
      yearlyTotal,
      recentExpenses: recentExpenses.slice(0, 5),
      categoryTotals,
      chartData: JSON.stringify(chartData),
      title: 'Thống kê chi tiêu' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Lỗi khi tạo thống kê' });
  }
});

// Thống kê theo ngày
router.get('/daily', async (req, res) => {
  try {
    // Lấy ngày từ query hoặc sử dụng ngày hiện tại
    const date = req.query.date ? new Date(req.query.date) : new Date();
    
    // Lấy chi tiêu trong ngày
    const expenses = await Expense.getDailyExpenses(date);
    
    // Tính tổng chi tiêu
    const total = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    
    // Lấy chi tiêu theo danh mục
    const categoryTotals = await Expense.getCategoryTotals('day', { date });
    
    res.render('statistics/daily', { 
      expenses,
      date,
      total,
      categoryTotals,
      title: 'Thống kê chi tiêu theo ngày' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Lỗi khi tạo thống kê theo ngày' });
  }
});

// Thống kê theo tuần
router.get('/weekly', async (req, res) => {
  try {
    // Lấy ngày bắt đầu tuần từ query hoặc sử dụng ngày hiện tại
    let startDate;
    if (req.query.startDate) {
      startDate = new Date(req.query.startDate);
    } else {
      // Nếu không có startDate, tính toán ngày đầu tuần (Chủ nhật)
      startDate = new Date();
      const day = startDate.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ...
      startDate.setDate(startDate.getDate() - day); // Lùi về Chủ nhật
    }
    
    // Lấy chi tiêu trong tuần
    const expenses = await Expense.getWeeklyExpenses(startDate);
    
    // Tính tổng chi tiêu
    const total = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    
    // Lấy chi tiêu theo ngày trong tuần
    const weekdayTotals = await Expense.getWeekdayTotals(startDate);
    
    // Lấy chi tiêu theo danh mục
    const categoryTotals = await Expense.getCategoryTotals('week', { startDate });
    
    // Tạo dữ liệu cho biểu đồ theo ngày trong tuần
    const weekdayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    
    const weekdayData = new Array(7).fill(0);
    weekdayTotals.forEach(item => {
      weekdayData[item.weekday - 1] = parseFloat(item.total);
    });
    
    const chartData = {
      labels: weekdayNames,
      datasets: [{
        label: 'Chi tiêu theo ngày',
        data: weekdayData,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    };
    
    // Tính ngày kết thúc tuần
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    
    res.render('statistics/weekly', { 
      expenses,
      startDate,
      endDate,
      total,
      categoryTotals,
      chartData: JSON.stringify(chartData),
      title: 'Thống kê chi tiêu theo tuần' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Lỗi khi tạo thống kê theo tuần' });
  }
});

// Thống kê theo tháng
router.get('/monthly', async (req, res) => {
  try {
    // Lấy tháng và năm từ query hoặc sử dụng tháng và năm hiện tại
    const month = req.query.month ? parseInt(req.query.month) : new Date().getMonth() + 1;
    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
    
    // Lấy chi tiêu trong tháng
    const expenses = await Expense.getMonthlyExpenses(month, year);
    
    // Tính tổng chi tiêu
    const total = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    
    // Lấy chi tiêu theo ngày trong tháng
    const dailyTotals = await Expense.getDailyTotals(month, year);
    
    // Lấy chi tiêu theo danh mục
    const categoryTotals = await Expense.getCategoryTotals('month', { month, year });
    
    // Tạo dữ liệu cho biểu đồ theo danh mục
    const categoryData = {
      labels: categoryTotals.map(category => category.category),
      datasets: [{
        label: 'Chi tiêu theo danh mục',
        data: categoryTotals.map(category => category.total),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(201, 203, 207, 0.7)'
        ],
        borderWidth: 1
      }]
    };
    
    res.render('statistics/monthly', { 
      expenses,
      month,
      year,
      total,
      categoryTotals,
      chartData: JSON.stringify(categoryData),
      title: 'Thống kê chi tiêu theo tháng' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Lỗi khi tạo thống kê theo tháng' });
  }
});

// Thống kê theo năm
router.get('/yearly', async (req, res) => {
  try {
    // Lấy năm từ query hoặc sử dụng năm hiện tại
    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
    
    // Lấy chi tiêu trong năm
    const expenses = await Expense.getYearlyExpenses(year);
    
    // Tính tổng chi tiêu
    const total = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    
    // Lấy chi tiêu theo tháng trong năm
    const monthlyTotals = await Expense.getMonthlyTotals(year);
    
    // Lấy chi tiêu theo danh mục
    const categoryTotals = await Expense.getCategoryTotals('year', { year });
    
    // Tạo dữ liệu cho biểu đồ theo tháng
    const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 
                        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
    
    const monthlyData = new Array(12).fill(0);
    monthlyTotals.forEach(item => {
      monthlyData[item.month - 1] = parseFloat(item.total);
    });
    
    const chartData = {
      labels: monthNames,
      datasets: [{
        label: 'Chi tiêu theo tháng',
        data: monthlyData,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    };
    
    res.render('statistics/yearly', { 
      expenses,
      year,
      total,
      categoryTotals,
      chartData: JSON.stringify(chartData),
      title: 'Thống kê chi tiêu theo năm' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Lỗi khi tạo thống kê theo năm' });
  }
});

module.exports = router;
