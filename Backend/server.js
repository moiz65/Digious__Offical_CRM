const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const pool = require('./config/database');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Request logging middleware with body logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\n════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════`);
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log(`📨 Request Body:`, JSON.stringify(req.body, null, 2));
  }
  
  // Store original send function
  const originalSend = res.send;
  res.send = function(data) {
    console.log(`📬 Response Status: ${res.statusCode}`);
    if (data) {
      try {
        console.log(`📬 Response Body:`, JSON.stringify(JSON.parse(data), null, 2));
      } catch {
        console.log(`📬 Response Body:`, data);
      }
    }
    console.log(`════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════\n`);
    res.send = originalSend;
    return res.send(data);
  };
  
  next();
});

// Import Routes
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const departmentRoutes = require('./routes/departments');
const attendanceRoutes = require('./routes/attendance');
const companyRulesRoutes = require('./routes/company-rules');
const sessionsRoutes = require('./routes/sessions');
const breaksRoutes = require('./routes/breaks');

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    server: 'Digious CRM Backend',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/company-rules', companyRulesRoutes);
app.use('/api/v1/sessions', sessionsRoutes);
app.use('/api/v1/breaks', breaksRoutes);

// 404 Error handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    status: err.status || 500
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║     Digious CRM Backend Server Started Successfully       ║
╚═══════════════════════════════════════════════════════════╝

📍 Server URL: http://localhost:${PORT}
🏢 Environment: ${process.env.NODE_ENV || 'development'}
🔄 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}
🗄️  Database: ${process.env.DB_NAME || 'digious_crm'}

📚 Available Endpoints:
  ✓ GET    /health                        - Health check
  ✓ POST   /api/v1/auth/login              - User login
  ✓ POST   /api/v1/auth/signup             - User signup
  ✓ POST   /api/v1/auth/logout             - User logout
  ✓ POST   /api/v1/auth/refresh-token      - Refresh JWT token
  
  ✓ GET    /api/v1/employees              - Get all employees
  ✓ POST   /api/v1/employees              - Create new employee
  ✓ GET    /api/v1/employees/:id          - Get employee by ID
  ✓ PUT    /api/v1/employees/:id          - Update employee
  ✓ DELETE /api/v1/employees/:id          - Delete employee
  
  ✓ GET    /api/v1/departments            - Get all departments
  ✓ GET    /api/v1/departments/:id        - Get department by ID
  
  ✓ GET    /api/v1/attendance             - Get attendance records
  ✓ POST   /api/v1/attendance             - Record attendance
  ✓ GET    /api/v1/attendance/:employeeId - Get employee attendance

╔═══════════════════════════════════════════════════════════╗
║              Ready to accept requests! 🚀                ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    pool.end(() => {
      console.log('Database connection pool closed');
      process.exit(0);
    });
  });
});

module.exports = app;
