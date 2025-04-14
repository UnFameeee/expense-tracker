require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const expenseRoutes = require('./routes/expenses');
const incomeRoutes = require('./routes/incomes');
const budgetRoutes = require('./routes/budgets');
const statisticsRoutes = require('./routes/statistics');
const { runMigrations } = require('./config/migrations');
const { getTranslation, defaultLanguage } = require('./config/i18n');

// Initialize the app
const app = express();

// Set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Setup express-ejs-layouts
app.use(expressLayouts);
app.set('layout', 'layout');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// Language middleware
app.use((req, res, next) => {
  // Set default language
  req.language = defaultLanguage;
  
  // Get translation function
  res.locals.__ = getTranslation(req.language);
  
  // Make language available in views
  res.locals.currentLanguage = req.language;
  res.locals.defaultLanguage = defaultLanguage;
  
  next();
});

// Make some app data available to all views
app.use((req, res, next) => {
  // App name
  res.locals.appName = 'Expense Tracker';
  
  // Primary color
  res.locals.primaryColor = '#72d1a8';
  
  // Current year for footer
  res.locals.currentYear = new Date().getFullYear();
  
  // Categories with icons
  res.locals.categories = [
    { value: 'Food', label: 'Food', icon: '🍕' },
    { value: 'Transportation', label: 'Transportation', icon: '🚗' },
    { value: 'Shopping', label: 'Shopping', icon: '🛒' },
    { value: 'Bills', label: 'Bills', icon: '📄' },
    { value: 'Entertainment', label: 'Entertainment', icon: '🎮' },
    { value: 'Other', label: 'Other', icon: '📌' }
  ];
  
  next();
});

// Routes
app.use('/', expenseRoutes);
app.use('/incomes', incomeRoutes);
app.use('/budgets', budgetRoutes);
app.use('/statistics', statisticsRoutes);

// Chạy migrations để tạo các bảng cần thiết
(async () => {
  try {
    await runMigrations();
  } catch (error) {
    console.error('Error running migrations:', error);
  }
})();

// Start the server
const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
