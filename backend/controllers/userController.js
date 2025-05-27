const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/users');
const Token = require('../models/tokens');

console.log('✅ authController loaded');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  console.log('🛠 req.body is:', req.body);
  
  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }
  
  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  // Password strength validation
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }
  
  try {
    const user = await User.create(name, email, password);
    
    // Remove password_hash from response
    const { password_hash, ...userWithoutPassword } = user;
    
    // Create JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // Store token in database
    try {
      const tokenRecord = await Token.create(user.id, token, 'access', '7d');
      console.log('✅ Token created successfully:', tokenRecord.id);
    } catch (tokenError) {
      console.log('⚠️ Error creating token:', tokenError.message);
      // Continue anyway since JWT is valid
    }
    
    res.status(201).json({ 
      message: 'User created successfully', 
      user: userWithoutPassword,
      token 
    });
  } catch (err) {
    // Handle duplicate email error
    if (err.message.includes('duplicate key') && err.message.includes('email')) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  try {
    const user = await User.findByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    // Create JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log('🔑 JWT token created for user:', user.id);
    
    // Store token in database
    try {
      const tokenRecord = await Token.create(user.id, token, 'access', '7d');
      console.log('✅ Token stored in database:', tokenRecord.id);
      
      // Get updated user with token_id
      const updatedUser = await User.findById(user.id);
      const { password_hash, ...userWithoutPassword } = updatedUser;
      
      res.json({ 
        message: 'Login successful',
        user: userWithoutPassword,
        token 
      });
    } catch (tokenError) {
      console.log('⚠️ Error storing token:', tokenError.message);
      
      // Remove password_hash from response
      const { password_hash, ...userWithoutPassword } = user;
      
      res.json({ 
        message: 'Login successful',
        user: userWithoutPassword,
        token 
      });
    }
  } catch (err) {
    console.log('❌ Login error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      await Token.revokeToken(token);
    }
    
    res.json({ message: 'Logout successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.logoutAll = async (req, res) => {
  try {
    await Token.revokeAllUserTokens(req.user.id);
    res.json({ message: 'All sessions logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
