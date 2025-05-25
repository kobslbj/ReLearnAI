const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const auth = require('../middleware/auth');

// Test route without auth
router.get('/test', (req, res) => {
  res.json({ message: 'Question routes are working!' });
});

// Create a question set (folder + questions)
router.post('/question-set', auth, questionController.createQuestionSet);

module.exports = router; 