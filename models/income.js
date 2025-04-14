const db = require('../config/database');

class Income {
  static async getAll() {
    try {
      const [rows] = await db.query('SELECT * FROM incomes ORDER BY date DESC');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [rows] = await db.query('SELECT * FROM incomes WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async create(incomeData) {
    try {
      const { source, amount, date, description } = incomeData;
      const [result] = await db.query(
        'INSERT INTO incomes (source, amount, date, description) VALUES (?, ?, ?, ?)',
        [source, amount, date, description]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, incomeData) {
    try {
      const { source, amount, date, description } = incomeData;
      const [result] = await db.query(
        'UPDATE incomes SET source = ?, amount = ?, date = ?, description = ? WHERE id = ?',
        [source, amount, date, description, id]
      );
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.query('DELETE FROM incomes WHERE id = ?', [id]);
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  static async getTotalIncome() {
    try {
      const [rows] = await db.query('SELECT SUM(amount) as total FROM incomes');
      return rows[0].total || 0;
    } catch (error) {
      throw error;
    }
  }

  static async getLatestIncome() {
    try {
      const [rows] = await db.query('SELECT * FROM incomes ORDER BY date DESC LIMIT 1');
      return rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Income;
