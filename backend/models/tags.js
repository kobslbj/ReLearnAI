const pool = require('../db/db');

const Tag = {
  async create(name) {
    const result = await pool.query(
      'INSERT INTO tags (name) VALUES ($1) RETURNING *',
      [name]
    );
    return result.rows[0];
  },

  async findAll() {
    const result = await pool.query('SELECT * FROM tags ORDER BY created_at DESC');
    return result.rows;
  },

  async findByName(name) {
    const result = await pool.query('SELECT * FROM tags WHERE name = $1', [name]);
    return result.rows[0];
  }
};

module.exports = Tag;
