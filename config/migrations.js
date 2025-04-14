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

// Hàm tạo bảng users nếu chưa tồn tại
async function createUsersTable() {
  const exists = await tableExists('users');
  if (!exists) {
    try {
      await db.query(`
        CREATE TABLE users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          email VARCHAR(100) NOT NULL UNIQUE,
          role ENUM('admin', 'user') DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Users table created successfully');
    } catch (error) {
      console.error('Error creating users table:', error);
    }
  } else {
    console.log('Users table already exists');
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
          user_id INT NOT NULL,
          description VARCHAR(255) NOT NULL,
          amount DECIMAL(10, 2) NOT NULL,
          category VARCHAR(100) NOT NULL,
          date DATE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      console.log('Expenses table created successfully');
    } catch (error) {
      console.error('Error creating expenses table:', error);
    }
  } else {
    console.log('Expenses table already exists');
    
    // Check if user_id column exists, add it if not
    try {
      const [columns] = await db.query(`SHOW COLUMNS FROM expenses LIKE 'user_id'`);
      if (columns.length === 0) {
        await db.query(`ALTER TABLE expenses ADD COLUMN user_id INT NOT NULL DEFAULT 1 AFTER id`);
        await db.query(`ALTER TABLE expenses ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`);
        console.log('Added user_id column to expenses table');
      }
    } catch (error) {
      console.error('Error updating expenses table:', error);
    }
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
          user_id INT NOT NULL,
          source VARCHAR(100) NOT NULL,
          amount DECIMAL(10, 2) NOT NULL,
          date DATE NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      console.log('Incomes table created successfully');
    } catch (error) {
      console.error('Error creating incomes table:', error);
    }
  } else {
    console.log('Incomes table already exists');
    
    // Check if user_id column exists, add it if not
    try {
      const [columns] = await db.query(`SHOW COLUMNS FROM incomes LIKE 'user_id'`);
      if (columns.length === 0) {
        await db.query(`ALTER TABLE incomes ADD COLUMN user_id INT NOT NULL DEFAULT 1 AFTER id`);
        await db.query(`ALTER TABLE incomes ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`);
        console.log('Added user_id column to incomes table');
      }
    } catch (error) {
      console.error('Error updating incomes table:', error);
    }
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
          user_id INT NOT NULL,
          base_salary DECIMAL(10, 2) NOT NULL,
          month INT NOT NULL,
          year INT NOT NULL,
          savings_goal DECIMAL(10, 2) NOT NULL,
          category_limits TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY user_month_year_unique (user_id, month, year),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      console.log('Budgets table created successfully');
    } catch (error) {
      console.error('Error creating budgets table:', error);
    }
  } else {
    console.log('Budgets table already exists');
    
    // Check if user_id column exists, add it if not
    try {
      const [columns] = await db.query(`SHOW COLUMNS FROM budgets LIKE 'user_id'`);
      if (columns.length === 0) {
        await db.query(`ALTER TABLE budgets ADD COLUMN user_id INT NOT NULL DEFAULT 1 AFTER id`);
        await db.query(`ALTER TABLE budgets ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`);
        // Update unique constraint to include user_id
        await db.query(`ALTER TABLE budgets DROP INDEX month_year_unique`);
        await db.query(`ALTER TABLE budgets ADD UNIQUE KEY user_month_year_unique (user_id, month, year)`);
        console.log('Added user_id column to budgets table');
      }
    } catch (error) {
      console.error('Error updating budgets table:', error);
    }
  }
}

// Hàm chạy tất cả các migrations
async function runMigrations() {
  try {
    await createUsersTable();
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
