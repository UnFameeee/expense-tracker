const express = require('express');
const router = express.Router();
const Expense = require('../models/expense');

// GET home page - list all expenses
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.getAll();
    
    // Calculate total expenses
    const total = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    
    res.render('index', { 
      expenses, 
      total: total.toFixed(2),
      title: 'Expense Tracker' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Error fetching expenses' });
  }
});

// GET form to create new expense
router.get('/expenses/new', (req, res) => {
  res.render('expenses/new', { title: 'Add New Expense' });
});

// POST create new expense
router.post('/expenses', async (req, res) => {
  try {
    await Expense.create(req.body);
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Error creating expense' });
  }
});

// GET form to edit expense
router.get('/expenses/:id/edit', async (req, res) => {
  try {
    const expense = await Expense.getById(req.params.id);
    if (!expense) {
      return res.status(404).render('error', { message: 'Expense not found' });
    }
    res.render('expenses/edit', { expense, title: 'Edit Expense' });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Error fetching expense' });
  }
});

// PUT update expense
router.put('/expenses/:id', async (req, res) => {
  try {
    await Expense.update(req.params.id, req.body);
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Error updating expense' });
  }
});

// DELETE expense
router.delete('/expenses/:id', async (req, res) => {
  try {
    await Expense.delete(req.params.id);
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Error deleting expense' });
  }
});

module.exports = router;
