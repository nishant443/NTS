require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

connectDB();

const app = express();

// CORS configuration MUST come before everything else on Vercel
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://frontend-seven-pi-28.vercel.app',
    'https://frontend-git-main-nishart443-projects.vercel.app',
    'https://frontend-git-main-nishant443s-projects.vercel.app',
    process.env.CLIENT_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
// Handle preflight requests explicitly BEFORE any other middleware
app.options('*', cors(corsOptions));

// Security middleware - after CORS
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// Rate limiting - skip for OPTIONS requests (preflight)
const limiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: 300,
  skip: (req) => req.method === 'OPTIONS' // Don't rate limit preflight
});
app.use('/api', limiter);

// Static files (uploaded documents)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/daily-work', require('./routes/dailyWorkRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/follow-ups', require('./routes/followUpRoutes'));
app.use('/api/quotations', require('./routes/quotationRoutes'));
app.use('/api/purchase-orders', require('./routes/purchaseOrderRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

app.get('/api/health', (req, res) => res.json({ success: true, message: 'NTS ERP API is running' }));

// 404 handler for unknown API routes
app.use('/api', (req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

app.use(errorHandler);

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`NTS ERP backend running on port ${PORT}`));
}

module.exports = app;