const prisma = require('../database/prismaClient');

// Lu1ea5y tu1ea5t cu1ea3 category cu1ee7a user
const getAllCategories = async (username) => {
  return prisma.category.findMany({
    where: { username },
    orderBy: { name: 'asc' }
  });
};

// Lu1ea5y chi tiu1ebft category theo id
const getCategoryById = async (id, username) => {
  const category = await prisma.category.findFirst({
    where: { id: Number(id), username }
  });
  
  if (!category) {
    throw new Error('Category khu00f4ng tu1ed3n tu1ea1i hou1eb7c khu00f4ng thuu1ed9c vu1ec1 bu1ea1n');
  }
  
  return category;
};

// Thu00eam category mu1edbi
const addCategory = async ({ name, color, icon, username }) => {
  // Kiu1ec3m tra tru00f9ng tu00ean category cu1ee7a user
  const existingCategory = await prisma.category.findFirst({
    where: { name, username }
  });
  
  if (existingCategory) {
    throw new Error(`Category "${name}" u0111u00e3 tu1ed3n tu1ea1i`);
  }
  
  return prisma.category.create({
    data: {
      name,
      color: color || '#72d1a8',
      icon: icon || 'bi-tag',
      username
    }
  });
};

// Cu1eadp nhu1eadt category
const updateCategory = async (id, { name, color, icon }, username) => {
  // Kiu1ec3m tra category cu00f3 tu1ed3n tu1ea1i vu00e0 thuu1ed9c vu1ec1 user nu00e0y khu00f4ng
  const category = await prisma.category.findFirst({
    where: { id: Number(id), username }
  });

  if (!category) {
    throw new Error('Category khu00f4ng tu1ed3n tu1ea1i hou1eb7c khu00f4ng thuu1ed9c vu1ec1 bu1ea1n');
  }
  
  // Nu1ebfu thay u0111u1ed5i tu00ean, kiu1ec3m tra tru00f9ng tu00ean
  if (name && name !== category.name) {
    const existingCategory = await prisma.category.findFirst({
      where: { name, username, NOT: { id: Number(id) } }
    });
    
    if (existingCategory) {
      throw new Error(`Category "${name}" u0111u00e3 tu1ed3n tu1ea1i`);
    }
  }

  return prisma.category.update({
    where: { id: Number(id) },
    data: {
      name: name || category.name,
      color: color || category.color,
      icon: icon || category.icon
    }
  });
};

// Xu00f3a category
const deleteCategory = async (id, username) => {
  // Kiu1ec3m tra category cu00f3 tu1ed3n tu1ea1i vu00e0 thuu1ed9c vu1ec1 user nu00e0y khu00f4ng
  const category = await prisma.category.findFirst({
    where: { id: Number(id), username }
  });

  if (!category) {
    throw new Error('Category khu00f4ng tu1ed3n tu1ea1i hou1eb7c khu00f4ng thuu1ed9c vu1ec1 bu1ea1n');
  }
  
  // u0110u1ebfm su1ed1 lu01b0u1ee3ng expense su1eed du1ee5ng category nu00e0y
  const expenseCount = await prisma.expense.count({
    where: { categoryId: Number(id) }
  });
  
  if (expenseCount > 0) {
    // Cu1eadp nhu1eadt tu1ea5t cu1ea3 expense cu1ee7a category nu00e0y u0111u1ec3 gu1ee1 bu1ecf liu00ean ku1ebft
    await prisma.expense.updateMany({
      where: { categoryId: Number(id) },
      data: { categoryId: null }
    });
  }
  
  // Xu00f3a category
  return prisma.category.delete({
    where: { id: Number(id) }
  });
};

// Tu1ea1o cu00e1c category mu1eb7c u0111u1ecbnh cho user mu1edbi
const createDefaultCategories = async (username) => {
  const defaultCategories = [
    { name: 'u0102n uu1ed1ng', color: '#FF5252', icon: 'bi-cup-hot' },
    { name: 'Di chuyu1ec3n', color: '#4CAF50', icon: 'bi-car-front' },
    { name: 'Mua su1eafm', color: '#2196F3', icon: 'bi-cart' },
    { name: 'Hu00f3a u0111u01a1n', color: '#FF9800', icon: 'bi-receipt' },
    { name: 'Giu1ea3i tru00ed', color: '#9C27B0', icon: 'bi-controller' },
    { name: 'Su1ee9c khu1ecfe', color: '#00BCD4', icon: 'bi-hospital' },
    { name: 'Giu00e1o du1ee5c', color: '#3F51B5', icon: 'bi-book' },
    { name: 'Khu00e1c', color: '#607D8B', icon: 'bi-three-dots' }
  ];
  
  const createdCategories = [];
  
  for (const category of defaultCategories) {
    try {
      const newCategory = await prisma.category.create({
        data: {
          ...category,
          username
        }
      });
      createdCategories.push(newCategory);
    } catch (error) {
      console.error(`Lu1ed7i khi tu1ea1o category mu1eb7c u0111u1ecbnh ${category.name}:`, error);
    }
  }
  
  return createdCategories;
};

module.exports = {
  getAllCategories,
  getCategoryById,
  addCategory,
  updateCategory,
  deleteCategory,
  createDefaultCategories
};
