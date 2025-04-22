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

module.exports = {
  getAllExpenses,
  addExpense
};
