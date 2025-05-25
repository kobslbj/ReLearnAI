const fs = require('fs');
const path = require('path');
const db = require('./db/db');

const userSQL = fs.readFileSync(path.join(__dirname, '../db/users.sql'), 'utf8');
const tagSQL = fs.readFileSync(path.join(__dirname, '../db/tags.sql'), 'utf8');

db.query(userSQL)
  .then(() => {
    console.log('✅ User table initialized.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Failed to init user table:', err.message);
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
