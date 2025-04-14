const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// GET: Render login page
router.get('/login', (req, res) => {
  res.render('auth/login', { 
    title: 'Login', 
    error: null,
    layout: false // Don't use the standard layout
  });
});

// POST: Process login form
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Authenticate user
    const user = await User.authenticate(username, password);
    
    if (!user) {
      return res.render('auth/login', { 
        title: 'Login', 
        error: 'Invalid username or password',
        layout: false // Don't use the standard layout
      });
    }
    
    // Set user session
    req.session.userId = user.id;
    
    // Redirect to the original URL or dashboard
    const redirectUrl = req.session.returnTo || '/expenses';
    delete req.session.returnTo;
    
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Login error:', error);
    res.render('auth/login', { 
      title: 'Login', 
      error: 'An error occurred during login',
      layout: false // Don't use the standard layout
    });
  }
});

// Registration routes are disabled - only available through admin or create-admin script
// GET: Render register page - disabled
router.get('/register', (req, res) => {
  // Redirect to login page
  return res.redirect('/auth/login');
});

// POST: Process registration form - disabled
router.post('/register', (req, res) => {
  // Registration is disabled
  return res.redirect('/auth/login');
});

// GET: Process logout
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/auth/login');
  });
});

// GET: User profile
router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    
    if (!user) {
      return res.redirect('/auth/login');
    }
    
    res.render('auth/profile', { 
      title: 'Profile', 
      user,
      success: req.query.success || null
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).render('error', { 
      message: 'Error loading profile' 
    });
  }
});

// POST: Update profile
router.post('/profile', isAuthenticated, async (req, res) => {
  try {
    const { username, email } = req.body;
    
    await User.update(req.session.userId, {
      username,
      email,
      role: res.locals.user.role // Keep existing role
    });
    
    res.redirect('/auth/profile?success=Profile updated successfully');
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).render('error', { 
      message: 'Error updating profile' 
    });
  }
});

// POST: Change password
router.post('/change-password', isAuthenticated, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    if (newPassword !== confirmPassword) {
      return res.render('auth/profile', { 
        title: 'Profile', 
        user: res.locals.user,
        error: 'New passwords do not match'
      });
    }
    
    // Verify current password
    const user = await User.findByUsername(res.locals.user.username);
    const isValid = await User.authenticate(user.username, currentPassword);
    
    if (!isValid) {
      return res.render('auth/profile', { 
        title: 'Profile', 
        user: res.locals.user,
        error: 'Current password is incorrect'
      });
    }
    
    // Update password
    await User.updatePassword(req.session.userId, newPassword);
    
    res.redirect('/auth/profile?success=Password changed successfully');
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).render('error', { 
      message: 'Error changing password' 
    });
  }
});

// Admin routes
router.get('/users', isAdmin, async (req, res) => {
  try {
    const users = await User.getAll();
    
    res.render('auth/users', { 
      title: 'User Management', 
      users,
      success: req.query.success || null
    });
  } catch (error) {
    console.error('User management error:', error);
    res.status(500).render('error', { 
      message: 'Error loading user list' 
    });
  }
});

router.post('/users/:id/role', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).render('error', { 
        message: 'User not found' 
      });
    }
    
    await User.update(id, {
      username: user.username,
      email: user.email,
      role
    });
    
    res.redirect('/auth/users?success=User role updated');
  } catch (error) {
    console.error('Role update error:', error);
    res.status(500).render('error', { 
      message: 'Error updating user role' 
    });
  }
});

module.exports = router; 