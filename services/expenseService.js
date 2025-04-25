const prisma = require('../database/prismaClient');

// Trả về tất cả expenses của user
const getAllExpenses = async (username) => {
  return prisma.expense.findMany({
    where: { username },
    orderBy: { date: 'desc' },
    include: { category: true }
  });
};

// Thêm expense mới
const addExpense = async ({ amount, description, date, username, categoryId }) => {
  return prisma.expense.create({
    data: {
      amount: Number(amount),
      description,
      date: new Date(date),
      username,
      categoryId: categoryId ? Number(categoryId) : null
    },
    include: { category: true }
  });
};

// Cập nhật expense
const updateExpense = async (id, { amount, description, date, categoryId }, username) => {
  // Kiểm tra expense có tồn tại và thuộc về user này không
  const expense = await prisma.expense.findFirst({
    where: { id: Number(id), username }
  });

  if (!expense) {
    throw new Error('Expense không tồn tại hoặc không thuộc về bạn');
  }

  return prisma.expense.update({
    where: { id: Number(id) },
    data: {
      amount: Number(amount),
      description,
      date: new Date(date),
      categoryId: categoryId ? Number(categoryId) : null
    },
    include: { category: true }
  });
};

// Xóa expense
const deleteExpense = async (id, username) => {
  // Kiểm tra expense có tồn tại và thuộc về user này không
  const expense = await prisma.expense.findFirst({
    where: { id: Number(id), username }
  });

  if (!expense) {
    throw new Error('Expense không tồn tại hoặc không thuộc về bạn');
  }

  return prisma.expense.delete({
    where: { id: Number(id) }
  });
};

// Lấy thống kê chi tiêu theo danh mục
const getExpenseStatsByCategory = async (username, period = 'month') => {
  // Xác định khoảng thời gian
  const now = new Date();
  let startDate;
  
  switch (period) {
    case 'week':
      // Lấy thống kê 7 ngày gần nhất
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      // Lấy thống kê 30 ngày gần nhất
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
      break;
    case 'year':
      // Lấy thống kê 1 năm gần nhất
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      // Mặc định lấy thống kê 30 ngày
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
  }
  
  // Lấy tất cả chi tiêu trong khoảng thời gian
  const expenses = await prisma.expense.findMany({
    where: {
      username,
      date: { gte: startDate }
    },
    include: { category: true }
  });
  
  // Nhóm theo danh mục
  const statsByCategory = {};
  let totalAmount = 0;
  
  expenses.forEach(expense => {
    totalAmount += expense.amount;
    
    const categoryName = expense.category ? expense.category.name : 'Chưa phân loại';
    const categoryColor = expense.category ? expense.category.color : '#607D8B';
    const categoryIcon = expense.category ? expense.category.icon : 'bi-question-circle';
    const categoryId = expense.category ? expense.category.id : null;
    
    if (!statsByCategory[categoryName]) {
      statsByCategory[categoryName] = {
        categoryId,
        categoryName,
        categoryColor,
        categoryIcon,
        amount: 0,
        count: 0
      };
    }
    
    statsByCategory[categoryName].amount += expense.amount;
    statsByCategory[categoryName].count += 1;
  });
  
  // Chuyển đổi thành mảng và tính toán tỷ lệ
  const result = Object.values(statsByCategory).map(stat => ({
    ...stat,
    percentage: totalAmount > 0 ? Math.round((stat.amount / totalAmount) * 100) : 0
  }));
  
  // Sắp xếp theo số tiền giảm dần
  return result.sort((a, b) => b.amount - a.amount);
};

module.exports = {
  getAllExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getExpenseStatsByCategory
};
