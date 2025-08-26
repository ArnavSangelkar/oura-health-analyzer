const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Import routes
const ouraRoutes = require('./routes/oura');
const aiRoutes = require('./routes/ai');
const healthRoutes = require('./routes/health');

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Middleware
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://oura-health-analyzer.onrender.com'] 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/oura', ouraRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/health', healthRoutes);

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  // Try multiple possible build locations
  const possibleBuildPaths = [
    path.join(__dirname, '../frontend/build'),
    path.join(__dirname, '../build'),
    path.join(__dirname, '../../build')
  ];
  
  let frontendBuildPath = null;
  let indexPath = null;
  
  // Find the first valid build path
  for (const buildPath of possibleBuildPaths) {
    const indexFile = path.join(buildPath, 'index.html');
    if (fs.existsSync(buildPath) && fs.existsSync(indexFile)) {
      frontendBuildPath = buildPath;
      indexPath = indexFile;
      console.log(`✅ Frontend build found at: ${buildPath}`);
      break;
    }
  }
  
  if (frontendBuildPath && indexPath) {
    app.use(express.static(frontendBuildPath));
    
    app.get('*', (req, res) => {
      res.sendFile(indexPath);
    });
  } else {
    console.error('❌ Frontend build not found in any of these locations:');
    possibleBuildPaths.forEach(p => console.error(`  - ${p}`));
    
    // List what's available in parent directories
    console.error('Available files in parent directories:');
    possibleBuildPaths.forEach(p => {
      const parentDir = path.dirname(p);
      if (fs.existsSync(parentDir)) {
        console.error(`  ${parentDir}:`, fs.readdirSync(parentDir));
      }
    });
    
    // Fallback: serve a simple message
    app.get('*', (req, res) => {
      res.status(500).json({ 
        error: 'Frontend not built properly',
        message: 'Please check the build process',
        searchedPaths: possibleBuildPaths,
        currentDir: __dirname
      });
    });
  }
} else {
  // Development: serve from public directory
  app.use(express.static(path.join(__dirname, '../frontend/public')));
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health data analyzer ready!`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`�� Current directory: ${__dirname}`);
  console.log(`🏗️ Frontend build path: ${path.join(__dirname, '../frontend/build')}`);
});

module.exports = app;
