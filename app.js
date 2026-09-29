const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const issueRoutes = require('./routes/issues');
const commentRoutes = require('./routes/comments');
const dashboardRoutes = require('./routes/dashboard');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Security headers
app.use(helmet());

// CORS — allow only the configured client origin
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

// JSON body parser
app.use(express.json());

// Rate limiter for auth routes only (avoid brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { message: 'Too many requests, please try again later.' },
});

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/issues', commentRoutes); // nested: /api/issues/:id/comments
app.use('/api/dashboard', dashboardRoutes);

// Central error handler (must be last)
app.use(errorHandler);

module.exports = app;
