const prisma = require('../database/prismaClient');

// Lu1ea5y tu1ea5t cu1ea3 thu nhu1eadp cu1ee7a user
const getAllIncomes = async (username) => {
  return prisma.income.findMany({
    where: { username },
    orderBy: { date: 'desc' }
  });
};

// Lu1ea5y chi tiu1ebft thu nhu1eadp theo id
const getIncomeById = async (id, username) => {
  const income = await prisma.income.findFirst({
    where: { id: Number(id), username }
  });
  
  if (!income) {
    throw new Error('Thu nhu1eadp khu00f4ng tu1ed3n tu1ea1i hou1eb7c khu00f4ng thuu1ed9c vu1ec1 bu1ea1n');
  }
  
  return income;
};

// Thu00eam thu nhu1eadp mu1edbi
const addIncome = async ({ amount, description, date, source, isRecurring, frequency, username }) => {
  return prisma.income.create({
    data: {
      amount: Number(amount),
      description,
      date: new Date(date),
      source,
      isRecurring: Boolean(isRecurring),
      frequency: isRecurring ? frequency : null,
      username
    }
  });
};

// Cu1eadp nhu1eadt thu nhu1eadp
const updateIncome = async (id, { amount, description, date, source, isRecurring, frequency }, username) => {
  // Kiu1ec3m tra thu nhu1eadp cu00f3 tu1ed3n tu1ea1i vu00e0 thuu1ed9c vu1ec1 user nu00e0y khu00f4ng
  const income = await prisma.income.findFirst({
    where: { id: Number(id), username }
  });

  if (!income) {
    throw new Error('Thu nhu1eadp khu00f4ng tu1ed3n tu1ea1i hou1eb7c khu00f4ng thuu1ed9c vu1ec1 bu1ea1n');
  }

  return prisma.income.update({
    where: { id: Number(id) },
    data: {
      amount: amount !== undefined ? Number(amount) : income.amount,
      description: description || income.description,
      date: date ? new Date(date) : income.date,
      source: source || income.source,
      isRecurring: isRecurring !== undefined ? Boolean(isRecurring) : income.isRecurring,
      frequency: isRecurring ? (frequency || income.frequency) : null
    }
  });
};

// Xu00f3a thu nhu1eadp
const deleteIncome = async (id, username) => {
  // Kiu1ec3m tra thu nhu1eadp cu00f3 tu1ed3n tu1ea1i vu00e0 thuu1ed9c vu1ec1 user nu00e0y khu00f4ng
  const income = await prisma.income.findFirst({
    where: { id: Number(id), username }
  });

  if (!income) {
    throw new Error('Thu nhu1eadp khu00f4ng tu1ed3n tu1ea1i hou1eb7c khu00f4ng thuu1ed9c vu1ec1 bu1ea1n');
  }

  return prisma.income.delete({
    where: { id: Number(id) }
  });
};

// Lu1ea5y thu1ed1ng ku00ea thu nhu1eadp theo thu1eddi gian
const getIncomeStats = async (username, period = 'month') => {
  // Xu00e1c u0111u1ecbnh khou1ea3ng thu1eddi gian
  const now = new Date();
  let startDate;
  
  switch (period) {
    case 'week':
      // Lu1ea5y thu1ed1ng ku00ea 7 ngu00e0y gu1ea7n nhu1ea5t
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      // Lu1ea5y thu1ed1ng ku00ea 30 ngu00e0y gu1ea7n nhu1ea5t
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
      break;
    case 'year':
      // Lu1ea5y thu1ed1ng ku00ea 1 nu0103m gu1ea7n nhu1ea5t
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      // Mu1eb7c u0111u1ecbnh 30 ngu00e0y
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
  }
  
  // Lu1ea5y tu1ea5t cu1ea3 thu nhu1eadp trong khou1ea3ng thu1eddi gian
  const incomes = await prisma.income.findMany({
    where: {
      username,
      date: { gte: startDate }
    }
  });
  
  // Nhu00f3m theo ngu1ed3n thu nhu1eadp
  const statsBySource = {};
  let totalAmount = 0;
  
  incomes.forEach(income => {
    totalAmount += income.amount;
    
    const sourceName = income.source || 'Khu00e1c';
    
    if (!statsBySource[sourceName]) {
      statsBySource[sourceName] = {
        source: sourceName,
        amount: 0,
        count: 0
      };
    }
    
    statsBySource[sourceName].amount += income.amount;
    statsBySource[sourceName].count += 1;
  });
  
  // Chuyu1ec3n u0111u1ed5i thu00e0nh mu1ea3ng vu00e0 tu00ednh tu1ec9 lu1ec7 phu1ea7n tru0103m
  const result = Object.values(statsBySource).map(stat => ({
    ...stat,
    percentage: totalAmount > 0 ? Math.round((stat.amount / totalAmount) * 100) : 0
  }));
  
  // Su1eafp xu1ebfp theo su1ed1 tiu1ec1n giu1ea3m du1ea7n
  return {
    stats: result.sort((a, b) => b.amount - a.amount),
    totalIncome: totalAmount
  };
};

// Lu1ea5y thu1ed1ng ku00ea thu nhu1eadp - chi tiu00eau (cu00e2n u0111u1ed1i)
const getIncomeExpenseBalance = async (username, period = 'month') => {
  // Xu00e1c u0111u1ecbnh khou1ea3ng thu1eddi gian
  const now = new Date();
  let startDate;
  let periodLabel;
  
  switch (period) {
    case 'week':
      // Lu1ea5y thu1ed1ng ku00ea 7 ngu00e0y gu1ea7n nhu1ea5t
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      periodLabel = 'Tuu1ea7n nu00e0y';
      break;
    case 'month':
      // Lu1ea5y thu1ed1ng ku00ea 30 ngu00e0y gu1ea7n nhu1ea5t
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
      periodLabel = 'Thu00e1ng nu00e0y';
      break;
    case 'year':
      // Lu1ea5y thu1ed1ng ku00ea 1 nu0103m gu1ea7n nhu1ea5t
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
      periodLabel = 'Nu0103m nu00e0y';
      break;
    default:
      // Mu1eb7c u0111u1ecbnh 30 ngu00e0y
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
      periodLabel = 'Thu00e1ng nu00e0y';
  }
  
  // Lu1ea5y tu1ed5ng thu nhu1eadp
  const incomes = await prisma.income.findMany({
    where: {
      username,
      date: { gte: startDate }
    }
  });
  
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  
  // Lu1ea5y tu1ed5ng chi tiu00eau
  const expenses = await prisma.expense.findMany({
    where: {
      username,
      date: { gte: startDate }
    }
  });
  
  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Tu00ednh cu00e2n u0111u1ed1i
  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0;
  
  return {
    period: periodLabel,
    totalIncome,
    totalExpense,
    balance,
    savingsRate,
    isPositive: balance >= 0
  };
};

module.exports = {
  getAllIncomes,
  getIncomeById,
  addIncome,
  updateIncome,
  deleteIncome,
  getIncomeStats,
  getIncomeExpenseBalance
};
