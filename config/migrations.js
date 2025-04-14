const db = require('./database');

// Hàm kiểm tra xem bảng đã tồn tại chưa
async function tableExists(tableName) {
  try {
    const [rows] = await db.query(
      `SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?`,
      [tableName]
    );
    return rows.length > 0;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}

// Hàm tạo bảng expenses nếu chưa tồn tại
async function createExpensesTable() {
  const exists = await tableExists('expenses');
  if (!exists) {
    try {
      await db.query(`
        CREATE TABLE expenses (
          id INT AUTO_INCREMENT PRIMARY KEY,
          description VARCHAR(255) NOT NULL,
          amount DECIMAL(10, 2) NOT NULL,
          category VARCHAR(100) NOT NULL,
          date DATE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Expenses table created successfully');
    } catch (error) {
      console.error('Error creating expenses table:', error);
    }
  } else {
    console.log('Expenses table already exists');
  }
}

// Hàm tạo bảng incomes nếu chưa tồn tại
async function createIncomesTable() {
  const exists = await tableExists('incomes');
  if (!exists) {
    try {
      await db.query(`
        CREATE TABLE incomes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          source VARCHAR(100) NOT NULL,
          amount DECIMAL(10, 2) NOT NULL,
          date DATE NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Incomes table created successfully');
    } catch (error) {
      console.error('Error creating incomes table:', error);
    }
  } else {
    console.log('Incomes table already exists');
  }
}

// Hàm tạo bảng budgets nếu chưa tồn tại
async function createBudgetsTable() {
  const exists = await tableExists('budgets');
  if (!exists) {
    try {
      await db.query(`
        CREATE TABLE budgets (
          id INT AUTO_INCREMENT PRIMARY KEY,
          base_salary DECIMAL(10, 2) NOT NULL,
          month INT NOT NULL,
          year INT NOT NULL,
          savings_goal DECIMAL(10, 2) NOT NULL,
          category_limits TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY month_year_unique (month, year)
        )
      `);
      console.log('Budgets table created successfully');
    } catch (error) {
      console.error('Error creating budgets table:', error);
    }
  } else {
    console.log('Budgets table already exists');
  }
}

// Hàm chạy tất cả các migrations
async function runMigrations() {
  try {
    await createExpensesTable();
    await createIncomesTable();
    await createBudgetsTable();
    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
  }
}

module.exports = {
  runMigrations
};
