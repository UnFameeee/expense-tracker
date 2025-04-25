const prisma = require('../database/prismaClient');

// Lu1ea5y tu1ea5t cu1ea3 ngu00e2n su00e1ch cu1ee7a user
const getAllBudgets = async (username) => {
  return prisma.budget.findMany({
    where: { username },
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  });
};

// Lu1ea5y chi tiu1ebft ngu00e2n su00e1ch theo id
const getBudgetById = async (id, username) => {
  const budget = await prisma.budget.findFirst({
    where: { id: Number(id), username },
    include: { category: true }
  });
  
  if (!budget) {
    throw new Error('Ngu00e2n su00e1ch khu00f4ng tu1ed3n tu1ea1i hou1eb7c khu00f4ng thuu1ed9c vu1ec1 bu1ea1n');
  }
  
  return budget;
};

// Thu00eam ngu00e2n su00e1ch mu1edbi
const addBudget = async ({ amount, period, startDate, endDate, isRecurring, categoryId, username }) => {
  // Kiu1ec3m tra category cu00f3 tu1ed3n tu1ea1i vu00e0 thuu1ed9c vu1ec1 user nu00e0y khu00f4ng
  const category = await prisma.category.findFirst({
    where: { id: Number(categoryId), username }
  });
  
  if (!category) {
    throw new Error('Danh mu1ee5c khu00f4ng tu1ed3n tu1ea1i hou1eb7c khu00f4ng thuu1ed9c vu1ec1 bu1ea1n');
  }
  
  // Kiu1ec3m tra xem u0111u00e3 cu00f3 ngu00e2n su00e1ch cho danh mu1ee5c nu00e0y trong cu00f9ng chu ku1ef3 chu01b0a
  const existingBudget = await prisma.budget.findFirst({
    where: {
      categoryId: Number(categoryId),
      username,
      period,
      isRecurring: true
    }
  });
  
  if (existingBudget && isRecurring) {
    throw new Error(`u0110u00e3 cu00f3 ngu00e2n su00e1ch lu1eb7p lu1ea1i cho danh mu1ee5c nu00e0y trong chu ku1ef3 ${period}`);
  }
  
  return prisma.budget.create({
    data: {
      amount: Number(amount),
      period,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      isRecurring: Boolean(isRecurring),
      username,
      categoryId: Number(categoryId)
    },
    include: { category: true }
  });
};

// Cu1eadp nhu1eadt ngu00e2n su00e1ch
const updateBudget = async (id, { amount, period, startDate, endDate, isRecurring, categoryId }, username) => {
  // Kiu1ec3m tra ngu00e2n su00e1ch cu00f3 tu1ed3n tu1ea1i vu00e0 thuu1ed9c vu1ec1 user nu00e0y khu00f4ng
  const budget = await prisma.budget.findFirst({
    where: { id: Number(id), username }
  });

  if (!budget) {
    throw new Error('Ngu00e2n su00e1ch khu00f4ng tu1ed3n tu1ea1i hou1eb7c khu00f4ng thuu1ed9c vu1ec1 bu1ea1n');
  }
  
  // Nu1ebfu thay u0111u1ed5i category, kiu1ec3m tra category mu1edbi cu00f3 tu1ed3n tu1ea1i vu00e0 thuu1ed9c vu1ec1 user nu00e0y khu00f4ng
  if (categoryId && categoryId !== budget.categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: Number(categoryId), username }
    });
    
    if (!category) {
      throw new Error('Danh mu1ee5c khu00f4ng tu1ed3n tu1ea1i hou1eb7c khu00f4ng thuu1ed9c vu1ec1 bu1ea1n');
    }
    
    // Kiu1ec3m tra xem u0111u00e3 cu00f3 ngu00e2n su00e1ch cho danh mu1ee5c nu00e0y trong cu00f9ng chu ku1ef3 chu01b0a
    if (isRecurring) {
      const existingBudget = await prisma.budget.findFirst({
        where: {
          categoryId: Number(categoryId),
          username,
          period: period || budget.period,
          isRecurring: true,
          NOT: { id: Number(id) }
        }
      });
      
      if (existingBudget) {
        throw new Error(`u0110u00e3 cu00f3 ngu00e2n su00e1ch lu1eb7p lu1ea1i cho danh mu1ee5c nu00e0y trong chu ku1ef3 ${period || budget.period}`);
      }
    }
  }

  return prisma.budget.update({
    where: { id: Number(id) },
    data: {
      amount: amount !== undefined ? Number(amount) : budget.amount,
      period: period || budget.period,
      startDate: startDate ? new Date(startDate) : budget.startDate,
      endDate: endDate ? new Date(endDate) : budget.endDate,
      isRecurring: isRecurring !== undefined ? Boolean(isRecurring) : budget.isRecurring,
      categoryId: categoryId ? Number(categoryId) : budget.categoryId
    },
    include: { category: true }
  });
};

// Xu00f3a ngu00e2n su00e1ch
const deleteBudget = async (id, username) => {
  // Kiu1ec3m tra ngu00e2n su00e1ch cu00f3 tu1ed3n tu1ea1i vu00e0 thuu1ed9c vu1ec1 user nu00e0y khu00f4ng
  const budget = await prisma.budget.findFirst({
    where: { id: Number(id), username }
  });

  if (!budget) {
    throw new Error('Ngu00e2n su00e1ch khu00f4ng tu1ed3n tu1ea1i hou1eb7c khu00f4ng thuu1ed9c vu1ec1 bu1ea1n');
  }

  return prisma.budget.delete({
    where: { id: Number(id) }
  });
};

// Lu1ea5y thu1ed1ng ku00ea chi tiu00eau so vu1edbi ngu00e2n su00e1ch
const getBudgetStats = async (username) => {
  // Lu1ea5y tu1ea5t cu1ea3 ngu00e2n su00e1ch u0111ang hou1ea1t u0111u1ed9ng
  const budgets = await prisma.budget.findMany({
    where: { 
      username,
      OR: [
        { isRecurring: true },
        { 
          isRecurring: false,
          endDate: { gte: new Date() }
        }
      ]
    },
    include: { category: true }
  });
  
  if (!budgets || budgets.length === 0) {
    return [];
  }
  
  const now = new Date();
  const stats = [];
  
  for (const budget of budgets) {
    // Xu00e1c u0111u1ecbnh khou1ea3ng thu1eddi gian cho ngu00e2n su00e1ch
    let startDate, endDate;
    
    if (budget.isRecurring) {
      // Nu1ebfu lu00e0 ngu00e2n su00e1ch lu1eb7p lu1ea1i, tu00ednh tou00e1n khou1ea3ng thu1eddi gian hiu1ec7n tu1ea1i
      switch (budget.period) {
        case 'week':
          // Tu00ednh tuu1ea7n hiu1ec7n tu1ea1i
          startDate = new Date(now);
          startDate.setDate(now.getDate() - now.getDay()); // Chu1ee7 nhu1eadt lu00e0 ngu00e0y u0111u1ea7u tuu1ea7n
          startDate.setHours(0, 0, 0, 0);
          
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
          endDate.setHours(23, 59, 59, 999);
          break;
          
        case 'month':
          // Tu00ednh thu00e1ng hiu1ec7n tu1ea1i
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
          break;
          
        case 'year':
          // Tu00ednh nu0103m hiu1ec7n tu1ea1i
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
          break;
          
        default:
          // Mu1eb7c u0111u1ecbnh lu00e0 thu00e1ng
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      }
    } else {
      // Nu1ebfu lu00e0 ngu00e2n su00e1ch cu1ed1 u0111u1ecbnh, su1eed du1ee5ng thu1eddi gian u0111u00e3 u0111u1eb7t
      startDate = new Date(budget.startDate);
      endDate = budget.endDate ? new Date(budget.endDate) : new Date(now.getFullYear() + 1, 11, 31);
    }
    
    // Lu1ea5y tu1ed5ng chi tiu00eau trong khou1ea3ng thu1eddi gian
    const expenses = await prisma.expense.findMany({
      where: {
        username,
        categoryId: budget.categoryId,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });
    
    // Tu00ednh tu1ed5ng chi tiu00eau
    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Tu00ednh phu1ea7n tru0103m su1eed du1ee5ng ngu00e2n su00e1ch
    const percentUsed = budget.amount > 0 ? Math.round((totalSpent / budget.amount) * 100) : 0;
    
    // Tu00ednh su1ed1 ngu00e0y cu00f2n lu1ea1i
    const daysTotal = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
    
    // Tu00ednh tou00e1n tiu1ebfn u0111u1ed9 thu1eddi gian
    const timeProgress = daysTotal > 0 ? Math.round((daysElapsed / daysTotal) * 100) : 100;
    
    // Xu00e1c u0111u1ecbnh tru1ea1ng thu00e1i ngu00e2n su00e1ch
    let status = 'normal';
    if (percentUsed > 100) {
      status = 'exceeded';
    } else if (percentUsed > timeProgress + 10) {
      status = 'warning';
    } else if (percentUsed < timeProgress - 20) {
      status = 'good';
    }
    
    stats.push({
      budget,
      totalSpent,
      percentUsed,
      timeProgress,
      daysRemaining,
      startDate,
      endDate,
      status
    });
  }
  
  return stats;
};

module.exports = {
  getAllBudgets,
  getBudgetById,
  addBudget,
  updateBudget,
  deleteBudget,
  getBudgetStats
};
