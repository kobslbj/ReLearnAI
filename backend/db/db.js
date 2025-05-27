const { Pool } = require('pg');

// For Render deployment, use DATABASE_URL if available
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'example',
  database: process.env.DB_NAME || 'mistake_db',
  port: process.env.DB_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false // Required for Render PostgreSQL
  } : false
});

module.exports = pool;
