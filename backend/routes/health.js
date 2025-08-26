const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Health check endpoint
router.get('/', (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    platform: process.platform,
    memory: process.memoryUsage(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      JWT_SECRET_SET: !!process.env.JWT_SECRET && 
                      process.env.JWT_SECRET !== 'your-secret-key' && 
                      process.env.JWT_SECRET !== 'your-super-secure-jwt-secret-key-here-change-this-in-production',
      PORT: process.env.PORT,
      CORS_ORIGIN: req.headers.origin || 'none'
    },
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    }
  };

  res.json(health);
});

// System info endpoint
router.get('/system', (req, res) => {
  try {
    const dataDir = path.join(__dirname, '../data');
    const usersFile = path.join(dataDir, 'users.json');
    
    const systemInfo = {
      dataDirectory: {
        path: dataDir,
        exists: fs.existsSync(dataDir),
        writable: fs.accessSync ? (() => {
          try { fs.accessSync(dataDir, fs.constants.W_OK); return true; } 
          catch { return false; }
        })() : 'unknown'
      },
      usersFile: {
        path: usersFile,
        exists: fs.existsSync(usersFile),
        size: fs.existsSync(usersFile) ? fs.statSync(usersFile).size : 0
      },
      currentWorkingDirectory: process.cwd(),
      backendDirectory: __dirname,
      packageJson: {
        exists: fs.existsSync(path.join(__dirname, '../../package.json')),
        path: path.join(__dirname, '../../package.json')
      }
    };

    res.json(systemInfo);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get system info',
      message: error.message
    });
  }
});

module.exports = router;

