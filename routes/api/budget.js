const express = require('express');
const router = express.Router();
const {
  getAllBudgets,
  getBudgetById,
  addBudget,
  updateBudget,
  deleteBudget,
  getBudgetStats
} = require('../../services/budgetService');

// Middleware xu00e1c thu1ef1c JWT (du00f9ng lu1ea1i tu1eeb app.js)
const jwt = require('jsonwebtoken');
const SECRET = process.env.SECRET || 'expense_secret_key';

function authMiddleware(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth) return res.status(401).json({ error: 'Chu01b0a u0111u0103ng nhu1eadp' });
  const token = auth.split(' ')[1];
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(401).json({ error: 'Token khu00f4ng hu1ee3p lu1ec7' });
    req.user = user;
    next();
  });
}

// Validation middleware
function validateBudget(req, res, next) {
  const { amount, period, startDate, categoryId } = req.body;
  const errors = {};
  
  if (!amount) {
    errors.amount = 'Su1ed1 tiu1ec1n ngu00e2n su00e1ch khu00f4ng u0111u01b0u1ee3c u0111u1ec3 tru1ed1ng';
  } else if (isNaN(amount) || Number(amount) <= 0) {
    errors.amount = 'Su1ed1 tiu1ec1n phu1ea3i lu00e0 su1ed1 du01b0u01a1ng';
  }
  
  if (!period) {
    errors.period = 'Chu ku1ef3 ngu00e2n su00e1ch khu00f4ng u0111u01b0u1ee3c u0111u1ec3 tru1ed1ng';
  } else if (!['week', 'month', 'year'].includes(period)) {
    errors.period = 'Chu ku1ef3 phu1ea3i lu00e0 week, month hou1eb7c year';
  }
  
  if (!startDate) {
    errors.startDate = 'Ngu00e0y bu1eaft u0111u1ea7u khu00f4ng u0111u01b0u1ee3c u0111u1ec3 tru1ed1ng';
  } else {
    const dateObj = new Date(startDate);
    if (isNaN(dateObj.getTime())) {
      errors.startDate = 'Ngu00e0y bu1eaft u0111u1ea7u khu00f4ng hu1ee3p lu1ec7';
    }
  }
  
  if (!categoryId) {
    errors.categoryId = 'Danh mu1ee5c khu00f4ng u0111u01b0u1ee3c u0111u1ec3 tru1ed1ng';
  } else if (isNaN(categoryId) || Number(categoryId) <= 0) {
    errors.categoryId = 'Danh mu1ee5c khu00f4ng hu1ee3p lu1ec7';
  }
  
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }
  
  next();
}

// GET /api/budgets - Lu1ea5y tu1ea5t cu1ea3 ngu00e2n su00e1ch
router.get('/', authMiddleware, async (req, res) => {
  try {
    const budgets = await getAllBudgets(req.user.username);
    res.json(budgets);
  } catch (err) {
    console.error('Lu1ed7i khi lu1ea5y ngu00e2n su00e1ch:', err);
    res.status(500).json({ error: 'Lu1ed7i lu1ea5y du1eef liu1ec7u tu1eeb database', details: err.message });
  }
});

// GET /api/budgets/stats - Lu1ea5y thu1ed1ng ku00ea ngu00e2n su00e1ch
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const stats = await getBudgetStats(req.user.username);
    res.json(stats);
  } catch (err) {
    console.error('Lu1ed7i khi lu1ea5y thu1ed1ng ku00ea ngu00e2n su00e1ch:', err);
    res.status(500).json({ error: 'Lu1ed7i lu1ea5y du1eef liu1ec7u tu1eeb database', details: err.message });
  }
});

// GET /api/budgets/:id - Lu1ea5y chi tiu1ebft mu1ed9t ngu00e2n su00e1ch
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const budget = await getBudgetById(req.params.id, req.user.username);
    res.json(budget);
  } catch (err) {
    console.error('Lu1ed7i khi lu1ea5y chi tiu1ebft ngu00e2n su00e1ch:', err);
    if (err.message.includes('khu00f4ng tu1ed3n tu1ea1i')) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Lu1ed7i lu1ea5y du1eef liu1ec7u tu1eeb database', details: err.message });
  }
});

// POST /api/budgets - Thu00eam ngu00e2n su00e1ch mu1edbi
router.post('/', [authMiddleware, validateBudget], async (req, res) => {
  const { amount, period, startDate, endDate, isRecurring, categoryId } = req.body;
  
  try {
    const newBudget = await addBudget({
      amount,
      period,
      startDate,
      endDate,
      isRecurring,
      categoryId,
      username: req.user.username
    });
    res.status(201).json({ success: true, budget: newBudget });
  } catch (err) {
    console.error('Lu1ed7i khi thu00eam ngu00e2n su00e1ch:', err);
    if (err.message.includes('u0111u00e3 cu00f3 ngu00e2n su00e1ch')) {
      return res.status(409).json({ error: err.message });
    }
    if (err.message.includes('khu00f4ng tu1ed3n tu1ea1i')) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Lu1ed7i lu01b0u du1eef liu1ec7u vu00e0o database', details: err.message });
  }
});

// PUT /api/budgets/:id - Cu1eadp nhu1eadt ngu00e2n su00e1ch
router.put('/:id', [authMiddleware, validateBudget], async (req, res) => {
  const { id } = req.params;
  const { amount, period, startDate, endDate, isRecurring, categoryId } = req.body;
  
  try {
    const updatedBudget = await updateBudget(
      id,
      { amount, period, startDate, endDate, isRecurring, categoryId },
      req.user.username
    );
    res.json({ success: true, budget: updatedBudget });
  } catch (err) {
    console.error('Lu1ed7i khi cu1eadp nhu1eadt ngu00e2n su00e1ch:', err);
    if (err.message.includes('khu00f4ng tu1ed3n tu1ea1i')) {
      return res.status(404).json({ error: err.message });
    }
    if (err.message.includes('u0111u00e3 cu00f3 ngu00e2n su00e1ch')) {
      return res.status(409).json({ error: err.message });
    }
    res.status(500).json({ error: 'Lu1ed7i cu1eadp nhu1eadt ngu00e2n su00e1ch', details: err.message });
  }
});

// DELETE /api/budgets/:id - Xu00f3a ngu00e2n su00e1ch
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  
  try {
    await deleteBudget(id, req.user.username);
    res.json({ success: true, message: 'u0110u00e3 xu00f3a ngu00e2n su00e1ch thu00e0nh cu00f4ng' });
  } catch (err) {
    console.error('Lu1ed7i khi xu00f3a ngu00e2n su00e1ch:', err);
    if (err.message.includes('khu00f4ng tu1ed3n tu1ea1i')) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Lu1ed7i xu00f3a ngu00e2n su00e1ch', details: err.message });
  }
});

module.exports = router;
