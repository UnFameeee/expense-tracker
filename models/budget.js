const db = require('../config/database');

class Budget {
  static async getAll() {
    try {
      const [rows] = await db.query('SELECT * FROM budgets ORDER BY id DESC');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [rows] = await db.query('SELECT * FROM budgets WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async getCurrent() {
    try {
      const [rows] = await db.query(
        'SELECT * FROM budgets WHERE month = MONTH(CURDATE()) AND year = YEAR(CURDATE())'
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async create(budgetData) {
    try {
      const { base_salary, month, year, savings_goal, category_limits } = budgetData;
      const [result] = await db.query(
        'INSERT INTO budgets (base_salary, month, year, savings_goal, category_limits) VALUES (?, ?, ?, ?, ?)',
        [base_salary, month, year, savings_goal, JSON.stringify(category_limits)]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, budgetData) {
    try {
      const { base_salary, month, year, savings_goal, category_limits } = budgetData;
      const [result] = await db.query(
        'UPDATE budgets SET base_salary = ?, month = ?, year = ?, savings_goal = ?, category_limits = ? WHERE id = ?',
        [base_salary, month, year, savings_goal, JSON.stringify(category_limits), id]
      );
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.query('DELETE FROM budgets WHERE id = ?', [id]);
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  static async getMonthlyBudget(month, year) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM budgets WHERE month = ? AND year = ?',
        [month, year]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Tính toán số tiền còn lại có thể chi tiêu trong tháng hiện tại
  static async calculateRemainingBudget() {
    try {
      // Lấy ngân sách tháng hiện tại
      const budget = await this.getCurrent();
      if (!budget) return null;

      // Lấy tổng chi tiêu trong tháng hiện tại
      const [expenseRows] = await db.query(
        `SELECT SUM(amount) as total_expenses 
         FROM expenses 
         WHERE MONTH(date) = MONTH(CURDATE()) 
         AND YEAR(date) = YEAR(CURDATE())`
      );
      const totalExpenses = expenseRows[0].total_expenses || 0;

      // Lấy tổng thu nhập trong tháng hiện tại
      const [incomeRows] = await db.query(
        `SELECT SUM(amount) as total_income 
         FROM incomes 
         WHERE MONTH(date) = MONTH(CURDATE()) 
         AND YEAR(date) = YEAR(CURDATE())`
      );
      const totalIncome = incomeRows[0].total_income || 0;

      // Tính toán số tiền còn lại
      const totalAvailable = (budget.base_salary + totalIncome);
      const remainingBudget = totalAvailable - totalExpenses - budget.savings_goal;

      // Tính toán chi tiêu theo danh mục
      const [categoryRows] = await db.query(
        `SELECT category, SUM(amount) as total 
         FROM expenses 
         WHERE MONTH(date) = MONTH(CURDATE()) 
         AND YEAR(date) = YEAR(CURDATE())
         GROUP BY category`
      );

      const categoryLimits = JSON.parse(budget.category_limits || '{}');
      const categorySpending = {};

      categoryRows.forEach(row => {
        categorySpending[row.category] = {
          spent: row.total,
          limit: categoryLimits[row.category] || 0,
          remaining: (categoryLimits[row.category] || 0) - row.total
        };
      });

      // Thêm các danh mục có trong giới hạn nhưng chưa có chi tiêu
      Object.keys(categoryLimits).forEach(category => {
        if (!categorySpending[category]) {
          categorySpending[category] = {
            spent: 0,
            limit: categoryLimits[category],
            remaining: categoryLimits[category]
          };
        }
      });

      return {
        totalBudget: totalAvailable,
        totalExpenses,
        savingsGoal: budget.savings_goal,
        remainingBudget,
        categorySpending,
        daysInMonth: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate(),
        currentDay: new Date().getDate(),
        dailyBudget: remainingBudget / (new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate() + 1)
      };
    } catch (error) {
      throw error;
    }
  }

  // Dự báo chi tiêu dựa trên lịch sử
  static async forecastExpenses() {
    try {
      // Lấy chi tiêu trung bình 3 tháng gần nhất theo danh mục
      const [avgRows] = await db.query(
        `SELECT category, AVG(monthly_total) as avg_monthly
         FROM (
           SELECT category, MONTH(date) as month, YEAR(date) as year, SUM(amount) as monthly_total
           FROM expenses
           WHERE date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
           GROUP BY category, MONTH(date), YEAR(date)
           ORDER BY year DESC, month DESC
         ) as monthly_expenses
         GROUP BY category`
      );

      // Lấy chi tiêu tháng hiện tại theo danh mục
      const [currentRows] = await db.query(
        `SELECT category, SUM(amount) as total 
         FROM expenses 
         WHERE MONTH(date) = MONTH(CURDATE()) 
         AND YEAR(date) = YEAR(CURDATE())
         GROUP BY category`
      );

      const currentSpending = {};
      currentRows.forEach(row => {
        currentSpending[row.category] = row.total;
      });

      const forecast = {};
      avgRows.forEach(row => {
        forecast[row.category] = {
          averageMonthly: row.avg_monthly,
          currentMonth: currentSpending[row.category] || 0,
          projected: Math.max(row.avg_monthly, currentSpending[row.category] || 0)
        };
      });

      return forecast;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Budget;
