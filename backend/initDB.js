const fs = require('fs');
const path = require('path');
const db = require('./db/db');

const tagSQL = fs.readFileSync(path.join(__dirname, '../db/tags.sql'), 'utf8');

// Read and execute users.sql
const usersSql = fs.readFileSync(path.join(__dirname, './db/users.sql'), 'utf8');

// Execute both SQL files in sequence
db.query(usersSql)
  .then(() => {
    console.log('✅ User table initialized.');
    return db.query(questionsSql);
  })
  .then(() => {
    console.log('✅ Questions and folders tables initialized.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Failed to initialize database:', err.message);
    process.exit(1);
  });


console.log('Database Initialized.')
// (async () => {
//   try {
//     await db.query(userSQL);
//     console.log('✅ User table initialized.');

//     await db.query(tagSQL);
//     console.log('✅ Tag table initialized.');

//     process.exit(0);
//   } catch (err) {
//     console.error('❌ Failed to init tables:', err.message);
//     process.exit(1);
//   }
// })();
