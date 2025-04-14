const db = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  // Create a new user
  static async create(userData) {
    try {
      const { username, password, email, role } = userData;
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const [result] = await db.query(
        `INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)`,
        [username, hashedPassword, email, role || 'user']
      );
      
      return result.insertId;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Get user by ID
  static async findById(id) {
    try {
      const [rows] = await db.query(
        `SELECT id, username, email, role, created_at FROM users WHERE id = ?`,
        [id]
      );
      
      return rows[0] || null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  // Get user by username
  static async findByUsername(username) {
    try {
      const [rows] = await db.query(
        `SELECT * FROM users WHERE username = ?`,
        [username]
      );
      
      return rows[0] || null;
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw error;
    }
  }

  // Authenticate user
  static async authenticate(username, password) {
    try {
      const user = await this.findByUsername(username);
      
      if (!user) {
        return null;
      }
      
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return null;
      }
      
      // Don't return the password
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
    }
  }

  // Get all users (admin only)
  static async getAll() {
    try {
      const [rows] = await db.query(
        `SELECT id, username, email, role, created_at FROM users`
      );
      
      return rows;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  // Update user
  static async update(id, userData) {
    try {
      const { username, email, role } = userData;
      
      const [result] = await db.query(
        `UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?`,
        [username, email, role, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Update password
  static async updatePassword(id, newPassword) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      const [result] = await db.query(
        `UPDATE users SET password = ? WHERE id = ?`,
        [hashedPassword, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }
}

module.exports = User; 