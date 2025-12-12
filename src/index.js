require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./config/database');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middlewares/errorHandler');

// Modelleri import et (model dosyalarını kayıt et)
require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date(),
  });
});

// Database connection check
app.get('/api/v1/health/db', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      res.status(200).json({
        success: true,
        message: 'Database is connected',
        database: 'MongoDB',
      });
    } else {
      res.status(503).json({
        success: false,
        message: 'Database is not connected',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection error',
      error: error.message,
    });
  }
});

// API Routes
app.use(`${process.env.API_PREFIX || '/api/v1'}/auth`, require('./routes/auth'));
app.use(`${process.env.API_PREFIX || '/api/v1'}/admin`, require('./routes/admin'));
app.use(`${process.env.API_PREFIX || '/api/v1'}/owner`, require('./routes/owner'));
app.use(`${process.env.API_PREFIX || '/api/v1'}/products`, require('./routes/products'));
app.use(`${process.env.API_PREFIX || '/api/v1'}/couriers`, require('./routes/couriers'));
app.use(`${process.env.API_PREFIX || '/api/v1'}/orders`, require('./routes/orders'));
app.use(`${process.env.API_PREFIX || '/api/v1'}/consumers`, require('./routes/consumers'));


// Error Handler Middleware (must be last)
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
});

module.exports = app;

