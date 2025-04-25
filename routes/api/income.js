const express = require('express');
const router = express.Router();
const {
  getAllIncomes,
  getIncomeById,
  addIncome,
  updateIncome,
  deleteIncome,
  getIncomeStats,
  getIncomeExpenseBalance
} = require('../../services/incomeService');

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
function validateIncome(req, res, next) {
  const { amount, description, date, source } = req.body;
  const errors = {};
  
  if (!amount) {
    errors.amount = 'Su1ed1 tiu1ec1n khu00f4ng u0111u01b0u1ee3c u0111u1ec3 tru1ed1ng';
  } else if (isNaN(amount) || Number(amount) <= 0) {
    errors.amount = 'Su1ed1 tiu1ec1n phu1ea3i lu00e0 su1ed1 du01b0u01a1ng';
  }
  
  if (!description) {
    errors.description = 'Mu00f4 tu1ea3 khu00f4ng u0111u01b0u1ee3c u0111u1ec3 tru1ed1ng';
  } else if (description.length < 2) {
    errors.description = 'Mu00f4 tu1ea3 phu1ea3i cu00f3 u00edt nhu1ea5t 2 ku00fd tu1ef1';
  }
  
  if (!date) {
    errors.date = 'Ngu00e0y khu00f4ng u0111u01b0u1ee3c u0111u1ec3 tru1ed1ng';
  } else {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      errors.date = 'Ngu00e0y khu00f4ng hu1ee3p lu1ec7';
    }
  }
  
  if (!source) {
    errors.source = 'Nguu1ed3n thu nhu1eadp khu00f4ng u0111u01b0u1ee3c u0111u1ec3 tru1ed1ng';
  }
  
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }
  
  next();
}

// GET /api/incomes - Lu1ea5y tu1ea5t cu1ea3 thu nhu1eadp
router.get('/', authMiddleware, async (req, res) => {
  try {
    const incomes = await getAllIncomes(req.user.username);
    res.json(incomes);
  } catch (err) {
    console.error('Lu1ed7i khi lu1ea5y thu nhu1eadp:', err);
    res.status(500).json({ error: 'Lu1ed7i lu1ea5y du1eef liu1ec7u tu1eeb database', details: err.message });
  }
});

// GET /api/incomes/stats - Lu1ea5y thu1ed1ng ku00ea thu nhu1eadp
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const { period } = req.query; // 'week', 'month', 'year'
    const stats = await getIncomeStats(req.user.username, period);
    res.json(stats);
  } catch (err) {
    console.error('Lu1ed7i khi lu1ea5y thu1ed1ng ku00ea thu nhu1eadp:', err);
    res.status(500).json({ error: 'Lu1ed7i lu1ea5y du1eef liu1ec7u thu1ed1ng ku00ea', details: err.message });
  }
});

// GET /api/incomes/balance - Lu1ea5y cu00e2n u0111u1ed1i thu nhu1eadp - chi tiu00eau
router.get('/balance', authMiddleware, async (req, res) => {
  try {
    const { period } = req.query; // 'week', 'month', 'year'
    const balance = await getIncomeExpenseBalance(req.user.username, period);
    res.json(balance);
  } catch (err) {
    console.error('Lu1ed7i khi lu1ea5y cu00e2n u0111u1ed1i thu chi:', err);
    res.status(500).json({ error: 'Lu1ed7i lu1ea5y du1eef liu1ec7u cu00e2n u0111u1ed1i', details: err.message });
  }
});

// GET /api/incomes/:id - Lu1ea5y chi tiu1ebft mu1ed9t thu nhu1eadp
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const income = await getIncomeById(req.params.id, req.user.username);
    res.json(income);
  } catch (err) {
    console.error('Lu1ed7i khi lu1ea5y chi tiu1ebft thu nhu1eadp:', err);
    if (err.message.includes('khu00f4ng tu1ed3n tu1ea1i')) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Lu1ed7i lu1ea5y du1eef liu1ec7u tu1eeb database', details: err.message });
  }
});

// POST /api/incomes - Thu00eam thu nhu1eadp mu1edbi
router.post('/', [authMiddleware, validateIncome], async (req, res) => {
  const { amount, description, date, source, isRecurring, frequency } = req.body;
  
  try {
    const newIncome = await addIncome({
      amount,
      description,
      date,
      source,
      isRecurring,
      frequency,
      username: req.user.username
    });
    res.status(201).json({ success: true, income: newIncome });
  } catch (err) {
    console.error('Lu1ed7i khi thu00eam thu nhu1eadp:', err);
    res.status(500).json({ error: 'Lu1ed7i lu01b0u du1eef liu1ec7u vu00e0o database', details: err.message });
  }
});

// PUT /api/incomes/:id - Cu1eadp nhu1eadt thu nhu1eadp
router.put('/:id', [authMiddleware, validateIncome], async (req, res) => {
  const { id } = req.params;
  const { amount, description, date, source, isRecurring, frequency } = req.body;
  
  try {
    const updatedIncome = await updateIncome(
      id,
      { amount, description, date, source, isRecurring, frequency },
      req.user.username
    );
    res.json({ success: true, income: updatedIncome });
  } catch (err) {
    console.error('Lu1ed7i khi cu1eadp nhu1eadt thu nhu1eadp:', err);
    if (err.message.includes('khu00f4ng tu1ed3n tu1ea1i')) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Lu1ed7i cu1eadp nhu1eadt thu nhu1eadp', details: err.message });
  }
});

// DELETE /api/incomes/:id - Xu00f3a thu nhu1eadp
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  
  try {
    await deleteIncome(id, req.user.username);
    res.json({ success: true, message: 'u0110u00e3 xu00f3a thu nhu1eadp thu00e0nh cu00f4ng' });
  } catch (err) {
    console.error('Lu1ed7i khi xu00f3a thu nhu1eadp:', err);
    if (err.message.includes('khu00f4ng tu1ed3n tu1ea1i')) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Lu1ed7i xu00f3a thu nhu1eadp', details: err.message });
  }
});

module.exports = router;
