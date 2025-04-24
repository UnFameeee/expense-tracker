const prisma = require('../database/prismaClient');

// Trả về tất cả expenses của user
const getAllExpenses = async (username) => {
  return prisma.expense.findMany({
    where: { username },
    orderBy: { date: 'desc' }
  });
};

// Thêm expense mới
const addExpense = async ({ amount, description, date, username }) => {
  return prisma.expense.create({
    data: {
      amount: Number(amount),
      description,
      date: new Date(date),
      username
    }
  });
};

// Cập nhật expense
const updateExpense = async (id, { amount, description, date }, username) => {
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
      date: new Date(date)
    }
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

module.exports = {
  getAllExpenses,
  addExpense,
  updateExpense,
  deleteExpense
};
