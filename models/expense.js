const db = require('../config/database');

class Expense {
  static async getAll() {
    try {
      const [rows] = await db.query('SELECT * FROM expenses ORDER BY date DESC');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [rows] = await db.query('SELECT * FROM expenses WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async create(expenseData) {
    try {
      const { description, amount, category, date } = expenseData;
      const [result] = await db.query(
        'INSERT INTO expenses (description, amount, category, date) VALUES (?, ?, ?, ?)',
        [description, amount, category, date]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, expenseData) {
    try {
      const { description, amount, category, date } = expenseData;
      const [result] = await db.query(
        'UPDATE expenses SET description = ?, amount = ?, category = ?, date = ? WHERE id = ?',
        [description, amount, category, date, id]
      );
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.query('DELETE FROM expenses WHERE id = ?', [id]);
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  static async getDailyExpenses(date) {
    try {
      const formattedDate = new Date(date).toISOString().split('T')[0];
      const [rows] = await db.query(
        'SELECT * FROM expenses WHERE DATE(date) = ? ORDER BY date DESC',
        [formattedDate]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getWeeklyExpenses(startDate = null) {
    try {
      let query;
      let params = [];
      
      if (startDate) {
        // Nếu có startDate, lấy chi tiêu trong khoảng 7 ngày từ startDate
        const formattedStartDate = new Date(startDate).toISOString().split('T')[0];
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        const formattedEndDate = endDate.toISOString().split('T')[0];
        
        query = 'SELECT * FROM expenses WHERE DATE(date) BETWEEN ? AND ? ORDER BY date DESC';
        params = [formattedStartDate, formattedEndDate];
      } else {
        // Nếu không có startDate, lấy chi tiêu trong 7 ngày gần nhất
        query = 'SELECT * FROM expenses WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) ORDER BY date DESC';
      }
      
      const [rows] = await db.query(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getMonthlyExpenses(month, year) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM expenses WHERE MONTH(date) = ? AND YEAR(date) = ? ORDER BY date DESC',
        [month, year]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getYearlyExpenses(year) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM expenses WHERE YEAR(date) = ? ORDER BY date DESC',
        [year]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getCategoryTotals(period = 'month', options = {}) {
    try {
      let dateCondition = '';
      let params = [];
      
      switch (period) {
        case 'day':
          if (options.date) {
            const formattedDate = new Date(options.date).toISOString().split('T')[0];
            dateCondition = 'WHERE DATE(date) = ?';
            params.push(formattedDate);
          } else {
            dateCondition = 'WHERE DATE(date) = CURDATE()';
          }
          break;
        case 'week':
          if (options.startDate) {
            const formattedStartDate = new Date(options.startDate).toISOString().split('T')[0];
            const endDate = new Date(options.startDate);
            endDate.setDate(endDate.getDate() + 6);
            const formattedEndDate = endDate.toISOString().split('T')[0];
            
            dateCondition = 'WHERE DATE(date) BETWEEN ? AND ?';
            params.push(formattedStartDate, formattedEndDate);
          } else {
            dateCondition = 'WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
          }
          break;
        case 'month':
          if (options.month && options.year) {
            dateCondition = 'WHERE MONTH(date) = ? AND YEAR(date) = ?';
            params.push(options.month, options.year);
          } else {
            dateCondition = 'WHERE MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE())';
          }
          break;
        case 'year':
          if (options.year) {
            dateCondition = 'WHERE YEAR(date) = ?';
            params.push(options.year);
          } else {
            dateCondition = 'WHERE YEAR(date) = YEAR(CURDATE())';
          }
          break;
        default:
          dateCondition = '';
      }
      
      const [rows] = await db.query(
        `SELECT category, SUM(amount) as total 
         FROM expenses 
         ${dateCondition}
         GROUP BY category 
         ORDER BY total DESC`,
        params
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getTotalExpenses(period = 'month', options = {}) {
    try {
      let dateCondition = '';
      let params = [];
      
      switch (period) {
        case 'day':
          if (options.date) {
            const formattedDate = new Date(options.date).toISOString().split('T')[0];
            dateCondition = 'WHERE DATE(date) = ?';
            params.push(formattedDate);
          } else {
            dateCondition = 'WHERE DATE(date) = CURDATE()';
          }
          break;
        case 'week':
          if (options.startDate) {
            const formattedStartDate = new Date(options.startDate).toISOString().split('T')[0];
            const endDate = new Date(options.startDate);
            endDate.setDate(endDate.getDate() + 6);
            const formattedEndDate = endDate.toISOString().split('T')[0];
            
            dateCondition = 'WHERE DATE(date) BETWEEN ? AND ?';
            params.push(formattedStartDate, formattedEndDate);
          } else {
            dateCondition = 'WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
          }
          break;
        case 'month':
          if (options.month && options.year) {
            dateCondition = 'WHERE MONTH(date) = ? AND YEAR(date) = ?';
            params.push(options.month, options.year);
          } else {
            dateCondition = 'WHERE MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE())';
          }
          break;
        case 'year':
          if (options.year) {
            dateCondition = 'WHERE YEAR(date) = ?';
            params.push(options.year);
          } else {
            dateCondition = 'WHERE YEAR(date) = YEAR(CURDATE())';
          }
          break;
        default:
          dateCondition = '';
      }
      
      const [rows] = await db.query(
        `SELECT SUM(amount) as total FROM expenses ${dateCondition}`,
        params
      );
      return rows[0].total || 0;
    } catch (error) {
      throw error;
    }
  }

  static async getMonthlyTotals(year) {
    try {
      const [rows] = await db.query(
        `SELECT MONTH(date) as month, SUM(amount) as total 
         FROM expenses 
         WHERE YEAR(date) = ? 
         GROUP BY MONTH(date) 
         ORDER BY month`,
        [year]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getDailyTotals(month, year) {
    try {
      const [rows] = await db.query(
        `SELECT DAY(date) as day, SUM(amount) as total 
         FROM expenses 
         WHERE MONTH(date) = ? AND YEAR(date) = ? 
         GROUP BY DAY(date) 
         ORDER BY day`,
        [month, year]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getWeekdayTotals(startDate) {
    try {
      const formattedStartDate = new Date(startDate).toISOString().split('T')[0];
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      const [rows] = await db.query(
        `SELECT DAYOFWEEK(date) as weekday, SUM(amount) as total 
         FROM expenses 
         WHERE DATE(date) BETWEEN ? AND ? 
         GROUP BY DAYOFWEEK(date) 
         ORDER BY weekday`,
        [formattedStartDate, formattedEndDate]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Expense;
