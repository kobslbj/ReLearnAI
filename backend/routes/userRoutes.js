const express = require('express');
const router = express.Router();
const authController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/logout-all', auth, authController.logoutAll);

// Example of a protected route
router.get('/me', auth, (req, res) => {
  // Remove password_hash from response
  const { password_hash, ...userWithoutPassword } = req.user;
  res.json(userWithoutPassword);
});

module.exports = router;
