const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const equipmentRoutes = require('./routes/equipment');
const roomRoutes = require('./routes/rooms'); 
const movementRoutes = require('./routes/movements'); 
const locationChangeRoutes = require('./routes/locationChange');
// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/location-change', locationChangeRoutes);

// MongoDB Atlas connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error(' MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Routes
app.use('/api/equipment', equipmentRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/movements', movementRoutes);
// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Smart Equipment Inventory API is running!',
    version: '1.0.0',
    endpoints: {
      equipment: '/api/equipment',
      health: '/health'
    }
  });
});

// Health check route
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  res.status(200).json({ 
    status: 'OK', 
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// 404 handler - FIXED for Express 5
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('🚨 Error:', err.stack);
  res.status(500).json({ 
    success: false,
    error: 'Internal server error' 
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(`🗄️  Database: MongoDB Atlas`);
});