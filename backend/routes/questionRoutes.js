const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// Test route without auth
router.get('/test', (req, res) => {
  res.json({ message: 'Question routes are working!' });
});

// Debug JWT endpoint
router.post('/debug-jwt', (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token required in request body' });
    }
    
    console.log('🔍 Debug JWT - Token received:', token.substring(0, 50) + '...');
    console.log('🔍 Debug JWT - JWT_SECRET exists:', !!process.env.JWT_SECRET);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    res.json({
      message: 'JWT is valid',
      decoded: decoded,
      jwtSecretExists: !!process.env.JWT_SECRET
    });
  } catch (error) {
    res.status(400).json({
      error: 'JWT verification failed',
      details: {
        name: error.name,
        message: error.message
      }
    });
  }
});

// Debug Authorization header endpoint
router.post('/debug-auth-header', (req, res) => {
  try {
    const authHeader = req.header('Authorization');
    console.log('🔍 Raw Authorization header:', JSON.stringify(authHeader));
    
    if (!authHeader) {
      return res.json({ error: 'No Authorization header found' });
    }
    
    if (!authHeader.startsWith('Bearer ')) {
      return res.json({ 
        error: 'Authorization header does not start with Bearer',
        header: authHeader,
        startsWithBearer: authHeader.startsWith('Bearer ')
      });
    }
    
    const token = authHeader.replace('Bearer ', '');
    console.log('🔍 Extracted token length:', token.length);
    console.log('🔍 Token first 100 chars:', token.substring(0, 100));
    console.log('🔍 Token contains dots:', (token.match(/\./g) || []).length);
    
    // Try to verify the extracted token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    res.json({
      message: 'Authorization header processed successfully',
      authHeader: authHeader,
      extractedTokenLength: token.length,
      tokenDots: (token.match(/\./g) || []).length,
      decoded: decoded
    });
  } catch (error) {
    res.json({
      error: 'Failed to process Authorization header',
      authHeader: req.header('Authorization'),
      extractedToken: req.header('Authorization') ? req.header('Authorization').replace('Bearer ', '') : null,
      details: {
        name: error.name,
        message: error.message
      }
    });
  }
});

// Create a question set (folder + questions)
router.post('/question-set', questionController.createQuestionSet);

// Get all questions for a user
router.get('/get-all-questions/:user_id', questionController.getAllQuestions);

module.exports = router; 