const jwt = require('jsonwebtoken');
const User = require('../models/users');
const Token = require('../models/tokens');

const auth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.header('Authorization');
    console.log('🔍 Raw Authorization header:', JSON.stringify(authHeader));
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Invalid authorization header format');
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    console.log('🔍 Extracted token length:', token.length);
    console.log('🔍 Token first 100 chars:', token.substring(0, 100));
    console.log('🔍 Token last 50 chars:', token.substring(token.length - 50));
    console.log('🔍 Token contains dots:', (token.match(/\./g) || []).length);
    console.log('🔍 Token raw bytes:', Buffer.from(token).toString('hex').substring(0, 100));
    
    // Check if JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      console.log('❌ JWT_SECRET not found in environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    
    console.log('🔍 JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('🔍 JWT_SECRET length:', process.env.JWT_SECRET.length);
    
    // Try to manually parse JWT parts
    const parts = token.split('.');
    console.log('🔍 JWT parts count:', parts.length);
    if (parts.length === 3) {
      console.log('🔍 Header length:', parts[0].length);
      console.log('🔍 Payload length:', parts[1].length);
      console.log('🔍 Signature length:', parts[2].length);
      
      try {
        const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
        console.log('🔍 JWT Header:', header);
      } catch (e) {
        console.log('❌ Failed to parse JWT header:', e.message);
      }
      
      try {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        console.log('🔍 JWT Payload:', payload);
      } catch (e) {
        console.log('❌ Failed to parse JWT payload:', e.message);
      }
    }
    
    // Verify JWT token
    console.log('🔍 About to verify JWT...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ JWT decoded successfully:', { userId: decoded.userId, iat: decoded.iat, exp: decoded.exp });
    
    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log('❌ User not found:', decoded.userId);
      return res.status(401).json({ error: 'User not found' });
    }
    
    console.log('✅ User found:', { id: user.id, email: user.email });
    
    // Optional: Check if token exists in database (for enhanced security)
    try {
      const tokenRecord = await Token.findByToken(token);
      if (tokenRecord) {
        console.log('✅ Token found in database');
        req.tokenRecord = tokenRecord;
      } else {
        console.log('⚠️ Token not found in database, but JWT is valid');
      }
    } catch (tokenError) {
      console.log('⚠️ Error checking token in database:', tokenError.message);
      // Continue anyway since JWT is valid
    }
    
    // Add user info to request object
    req.user = user;
    req.userId = user.id;
    
    next();
  } catch (error) {
    console.log('❌ Auth error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token format: ' + error.message });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(401).json({ error: 'Authentication failed: ' + error.message });
  }
};

module.exports = auth;
