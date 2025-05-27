const db = require('../db/db');
const crypto = require('crypto');

class Token {
  static async create(userId, tokenString, tokenType = 'access', expiresIn = '7d') {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // Calculate expiration time
      const expirationTime = this.calculateExpiration(expiresIn);
      
      // Hash the token for security
      const tokenHash = crypto.createHash('sha256').update(tokenString).digest('hex');
      
      const query = `
        INSERT INTO tokens (user_id, token_hash, token_type, expires_at)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      
      const result = await client.query(query, [userId, tokenHash, tokenType, expirationTime]);
      const token = result.rows[0];

      // Update user's token_id to reference the latest token
      await client.query(
        'UPDATE users SET token_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [token.id, userId]
      );

      await client.query('COMMIT');
      return token;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  static async findByToken(tokenString) {
    const tokenHash = crypto.createHash('sha256').update(tokenString).digest('hex');
    
    const query = `
      SELECT t.*, u.id as user_id, u.name, u.email 
      FROM tokens t
      JOIN users u ON t.user_id = u.id
      WHERE t.token_hash = $1 
        AND t.expires_at > CURRENT_TIMESTAMP 
        AND t.is_revoked = FALSE
    `;
    
    const result = await db.query(query, [tokenHash]);
    return result.rows[0];
  }

  static async revokeToken(tokenString) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      const tokenHash = crypto.createHash('sha256').update(tokenString).digest('hex');
      
      const query = `
        UPDATE tokens 
        SET is_revoked = TRUE, updated_at = CURRENT_TIMESTAMP
        WHERE token_hash = $1
        RETURNING *
      `;
      
      const result = await client.query(query, [tokenHash]);
      const token = result.rows[0];

      if (token) {
        // Clear the user's token_id if this was their current token
        await client.query(
          'UPDATE users SET token_id = NULL, updated_at = CURRENT_TIMESTAMP WHERE token_id = $1',
          [token.id]
        );
      }

      await client.query('COMMIT');
      return token;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  static async revokeAllUserTokens(userId) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      const query = `
        UPDATE tokens 
        SET is_revoked = TRUE, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1 AND is_revoked = FALSE
        RETURNING *
      `;
      
      const result = await client.query(query, [userId]);

      // Clear the user's token_id
      await client.query(
        'UPDATE users SET token_id = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [userId]
      );

      await client.query('COMMIT');
      return result.rows;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  static async cleanupExpiredTokens() {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // Get expired/revoked token IDs
      const expiredTokensQuery = `
        SELECT id FROM tokens 
        WHERE expires_at < CURRENT_TIMESTAMP OR is_revoked = TRUE
      `;
      const expiredTokens = await client.query(expiredTokensQuery);
      const expiredTokenIds = expiredTokens.rows.map(row => row.id);

      if (expiredTokenIds.length > 0) {
        // Clear token_id from users table for expired tokens
        await client.query(
          'UPDATE users SET token_id = NULL, updated_at = CURRENT_TIMESTAMP WHERE token_id = ANY($1)',
          [expiredTokenIds]
        );

        // Delete expired tokens
        const deleteQuery = `
          DELETE FROM tokens 
          WHERE expires_at < CURRENT_TIMESTAMP OR is_revoked = TRUE
        `;
        const result = await client.query(deleteQuery);
        
        await client.query('COMMIT');
        return result.rowCount;
      }

      await client.query('COMMIT');
      return 0;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  static async getUserTokens(userId) {
    const query = `
      SELECT * FROM tokens 
      WHERE user_id = $1 
        AND expires_at > CURRENT_TIMESTAMP 
        AND is_revoked = FALSE
      ORDER BY created_at DESC
    `;
    
    const result = await db.query(query, [userId]);
    return result.rows;
  }

  static calculateExpiration(expiresIn) {
    const now = new Date();
    
    if (typeof expiresIn === 'string') {
      const unit = expiresIn.slice(-1);
      const value = parseInt(expiresIn.slice(0, -1));
      
      switch (unit) {
        case 's': // seconds
          return new Date(now.getTime() + value * 1000);
        case 'm': // minutes
          return new Date(now.getTime() + value * 60 * 1000);
        case 'h': // hours
          return new Date(now.getTime() + value * 60 * 60 * 1000);
        case 'd': // days
          return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
        default:
          throw new Error('Invalid expiration format. Use format like "7d", "24h", "60m", "3600s"');
      }
    }
    
    if (typeof expiresIn === 'number') {
      // Assume milliseconds
      return new Date(now.getTime() + expiresIn);
    }
    
    throw new Error('Invalid expiration format');
  }
}

module.exports = Token; 