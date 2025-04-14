const User = require('../models/user');

// Check if user is authenticated
exports.isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  // Store the original URL they were trying to access
  req.session.returnTo = req.originalUrl;
  res.redirect('/auth/login');
};

// Check if user is admin
exports.isAdmin = async (req, res, next) => {
  if (!req.session || !req.session.userId) {
    req.session.returnTo = req.originalUrl;
    return res.redirect('/auth/login');
  }

  try {
    const user = await User.findById(req.session.userId);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).render('error', { 
        message: 'Access denied. Admin privileges required.' 
      });
    }
    
    next();
  } catch (error) {
    console.error('Error in admin authentication:', error);
    res.status(500).render('error', { 
      message: 'Internal server error during authentication' 
    });
  }
};

// Make user data available to all templates
exports.loadUser = async (req, res, next) => {
  res.locals.user = null;
  res.locals.isAuthenticated = false;
  res.locals.isAdmin = false;
  
  if (req.session && req.session.userId) {
    try {
      const user = await User.findById(req.session.userId);
      
      if (user) {
        res.locals.user = user;
        res.locals.isAuthenticated = true;
        res.locals.isAdmin = user.role === 'admin';
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  }
  
  next();
}; 