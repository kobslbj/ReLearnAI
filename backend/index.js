const express = require('express');
require('dotenv').config();
const cors = require('cors');

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*', // Replace with your frontend URL in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

const userRoutes = require('./routes/userRoutes');
app.use('/auth', userRoutes);

const tagRoutes = require('./routes/tagRoutes');
app.use('/tags', tagRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
