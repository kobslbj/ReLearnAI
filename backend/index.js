const express = require('express');
require('dotenv').config();
const cors = require('cors');

const app = express();

// Debug logging
console.log('🚀 Starting server...');
console.log('Environment:', process.env.NODE_ENV);

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Load routes
try {
  const userRoutes = require('./routes/userRoutes');
  const questionRoutes = require('./routes/questionRoutes');
  
  console.log('✅ Routes loaded successfully');
  
  // Mount routes
  app.use('/auth', userRoutes);
  app.use('/api', questionRoutes);
  
  console.log('✅ Routes mounted successfully');
} catch (error) {
  console.error('❌ Error loading routes:', error);
  process.exit(1);
}

// 404 handler - must be after all routes
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handling middleware - must be last
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

const tagRoutes = require('./routes/tagRoutes');
app.use('/tags', tagRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
  
  console.log(`✅ Server running on port ${PORT}`);
  console.log('Available routes:');
  console.log('- GET /health');
  console.log('- POST /auth/register');
  console.log('- POST /auth/login');
  console.log('- GET /auth/me');
  console.log('- GET /api/test');
  console.log('- POST /api/question-set');
  // console.log('- POST /tags');
  console.log('- GET /tags');
});
