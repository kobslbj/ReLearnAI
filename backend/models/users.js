const db = require('../db/db'); // ✅ 改成這樣
const bcrypt = require('bcrypt');

const User = {
  async create(name, email, password) {
    const hash = await bcrypt.hash(password, 10);
    const res = await db.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
      [name, email, hash]
    );
    return res.rows[0];
  },

  async findByEmail(email) {
    const res = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return res.rows[0];
  },
  
  async findById(id) {
    const res = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0];
  },

  async updateTokenId(userId, tokenId) {
    const res = await db.query(
      'UPDATE users SET token_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [tokenId, userId]
    );
    return res.rows[0];
  },

  async clearTokenId(userId) {
    const res = await db.query(
      'UPDATE users SET token_id = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [userId]
    );
    return res.rows[0];
  }
};

module.exports = User;
