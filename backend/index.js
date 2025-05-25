const express = require('express');
require('dotenv').config();
const cors = require('cors');

const app = express();

// Debug logging
console.log('🚀 Starting server...');

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*', // Replace with your frontend URL in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

const userRoutes = require('./routes/userRoutes');
const questionRoutes = require('./routes/questionRoutes');

console.log('✅ Routes loaded');

app.use('/auth', userRoutes);
app.use('/api', questionRoutes);

console.log('✅ Routes mounted');

const tagRoutes = require('./routes/tagRoutes');
app.use('/tags', tagRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log('Available routes:');
  console.log('- POST /auth/register');
  console.log('- POST /auth/login');
  console.log('- POST /api/question-set');
  // console.log('- POST /tags');
  console.log('- GET /tags');
});
