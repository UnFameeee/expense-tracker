require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const flash = require('connect-flash');
const expenseRoutes = require('./routes/expenses');
const incomeRoutes = require('./routes/incomes');
const budgetRoutes = require('./routes/budgets');
const statisticsRoutes = require('./routes/statistics');
const authRoutes = require('./routes/auth');
const { runMigrations } = require('./config/migrations');
const { getTranslation, defaultLanguage } = require('./config/i18n');
const { loadUser, isAuthenticated } = require('./middleware/auth');

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

// Setup session
app.use(session({
  secret: process.env.SESSION_SECRET || 'expense-tracker-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Setup flash messages
app.use(flash());

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

// Load user middleware
app.use(loadUser);

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
  
  // Flash messages
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/expenses', isAuthenticated, expenseRoutes);
app.use('/incomes', isAuthenticated, incomeRoutes);
app.use('/budgets', isAuthenticated, budgetRoutes);
app.use('/statistics', isAuthenticated, statisticsRoutes);

// Landing page route
app.get('/', (req, res) => {
  // If user is already authenticated, redirect to dashboard
  if (req.session && req.session.userId) {
    return res.redirect('/expenses');
  }
  
  // Otherwise show landing page
  res.render('landing', { 
    layout: false // Don't use the standard layout for the landing page
  });
});

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
