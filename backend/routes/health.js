const express = require('express');
const router = express.Router();

// Health check endpoint
router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Detailed health check
router.get('/detailed', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024)
    },
    services: {
      oura: !!process.env.OURA_TOKEN,
      openai: !!process.env.OPENAI_API_KEY,
      supabase: !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY)
    }
  };

  // Check if all required services are configured
  const missingServices = Object.entries(health.services)
    .filter(([_, configured]) => !configured)
    .map(([service]) => service);

  if (missingServices.length > 0) {
    health.status = 'degraded';
    health.warnings = `Missing configuration for: ${missingServices.join(', ')}`;
  }

  res.json(health);
});

// API status endpoint
router.get('/api', (req, res) => {
  res.json({
    status: 'operational',
    endpoints: {
      oura: '/api/oura',
      ai: '/api/ai',
      health: '/api/health'
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

