const express = require('express');
const router = express.Router();
const User = require('../controllers/authController');

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = await User.create(name, email, password);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findByEmail(email);
  if (!user) return res.status(401).json({ error: 'User not found' });

  const bcrypt = require('bcrypt');
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return res.status(401).json({ error: 'Invalid password' });

  res.json({ message: 'Login success', user });
});

module.exports = router;
