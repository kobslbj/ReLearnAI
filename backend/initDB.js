const fs = require('fs');
const path = require('path');
const db = require('./db/db');

console.log('🚀 Starting database initialization...');

// Function to wait for database connection
async function waitForDatabase(maxRetries = 30) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await db.query('SELECT 1');
      console.log('✅ Database connection established');
      return true;
    } catch (err) {
      console.log(`⏳ Waiting for database... (attempt ${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  throw new Error('Could not connect to database after maximum retries');
}

async function initializeDatabase() {
  try {
    // Wait for database to be ready
    await waitForDatabase();

    // Read and execute users.sql first (since tokens references users)
    const usersSql = fs.readFileSync(path.join(__dirname, '../db/users.sql'), 'utf8');
    console.log('📝 Executing users.sql...');
    await db.query(usersSql);
    console.log('✅ User table initialized.');

    // Read and execute token.sql
    const tokenSql = fs.readFileSync(path.join(__dirname, 'db/token.sql'), 'utf8');
    console.log('📝 Executing token.sql...');
    await db.query(tokenSql);
    console.log('✅ Token table initialized.');

    // Read and execute questions.sql
    const questionsSql = fs.readFileSync(path.join(__dirname, 'db/questions.sql'), 'utf8');
    console.log('📝 Executing questions.sql...');
    await db.query(questionsSql);
    console.log('✅ Questions and folders tables initialized.');

    console.log('🎉 Database initialization completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to initialize database:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  }
}

// Run initialization
initializeDatabase();
