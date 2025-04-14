require('dotenv').config();
const readline = require('readline');
const User = require('../models/user');
const db = require('../config/database');
const { runMigrations } = require('../config/migrations');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function createAdminUser() {
  try {
    // Run migrations first to ensure all tables exist
    await runMigrations();
    
    console.log('=== Create Admin User ===');
    
    // Check if admin already exists
    const [rows] = await db.query('SELECT * FROM users WHERE role = ?', ['admin']);
    
    if (rows.length > 0) {
      console.log('\nAn admin user already exists:');
      console.log(`Username: ${rows[0].username}`);
      console.log(`Email: ${rows[0].email}`);
      
      const answer = await askQuestion('Do you want to create another admin? (yes/no): ');
      
      if (answer.toLowerCase() !== 'yes') {
        console.log('Operation cancelled. Exiting...');
        return;
      }
    }
    
    // Get admin details
    const username = await askQuestion('Enter admin username: ');
    const email = await askQuestion('Enter admin email: ');
    const password = await askQuestion('Enter admin password: ');
    
    // Validate inputs
    if (!username || !email || !password) {
      console.log('All fields are required. Operation cancelled.');
      return;
    }
    
    // Create admin user
    const userId = await User.create({
      username,
      email,
      password,
      role: 'admin'
    });
    
    console.log(`\nAdmin user created successfully with ID: ${userId}`);
    console.log('You can now login with these credentials.');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    rl.close();
    process.exit();
  }
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Run the admin creation process
createAdminUser(); 