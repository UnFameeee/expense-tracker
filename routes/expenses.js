const express = require('express');
const router = express.Router();
const Expense = require('../models/expense');

// GET home page - list all expenses
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.getAll(req.session.userId);
    
    // Calculate total expenses
    const total = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    
    res.render('index', { 
      expenses, 
      total: total,
      title: 'Expense Tracker' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Error fetching expenses' });
  }
});

// GET form to create new expense
router.get('/new', (req, res) => {
  res.render('expenses/new', { title: 'Add New Expense' });
});

// POST create new expense
router.post('/', async (req, res) => {
  try {
    // Add user_id to expense data
    const expenseData = {
      ...req.body,
      user_id: req.session.userId
    };
    
    await Expense.create(expenseData);
    res.redirect('/expenses');
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Error creating expense' });
  }
});

// GET form to edit expense
router.get('/:id/edit', async (req, res) => {
  try {
    const expense = await Expense.getById(req.params.id, req.session.userId);
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
router.put('/:id', async (req, res) => {
  try {
    await Expense.update(req.params.id, req.body, req.session.userId);
    res.redirect('/expenses');
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Error updating expense' });
  }
});

// DELETE expense
router.delete('/:id', async (req, res) => {
  try {
    await Expense.delete(req.params.id, req.session.userId);
    res.redirect('/expenses');
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Error deleting expense' });
  }
});

module.exports = router;
