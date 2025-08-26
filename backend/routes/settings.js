const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// File path for persistent user settings storage
const SETTINGS_FILE = path.join(__dirname, '../data/user-settings.json');

// Ensure data directory exists
let dataDir;
try {
  dataDir = path.dirname(SETTINGS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('✅ Settings data directory created:', dataDir);
  }
} catch (error) {
  console.error('❌ Error creating settings data directory:', error);
  dataDir = null;
}

// Load user settings from file or start with empty object
let userSettings = {};
try {
  if (dataDir && fs.existsSync(SETTINGS_FILE)) {
    const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
    userSettings = JSON.parse(data);
    console.log(`✅ Loaded user settings from storage:`, SETTINGS_FILE);
  } else {
    console.log('ℹ️ No existing user settings storage found, starting with empty object');
  }
} catch (error) {
  console.error('❌ Error loading user settings:', error);
  userSettings = {};
}

// Save user settings to file with fallback
const saveUserSettings = () => {
  try {
    if (dataDir) {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(userSettings, null, 2));
      console.log('✅ User settings saved to file');
    } else {
      console.log('⚠️ Data directory not available, settings stored in memory only');
    }
  } catch (error) {
    console.error('❌ Error saving user settings:', error);
    console.log('⚠️ Settings will be stored in memory only');
  }
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Get user settings
router.get('/', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId.toString();
    const userData = userSettings[userId] || {};
    
    res.json({
      success: true,
      settings: userData
    });
  } catch (error) {
    console.error('Error getting user settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save user settings
router.post('/', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId.toString();
    const { ouraToken, openaiKey, notifications, autoRefresh, dataRetention, theme } = req.body;
    
    // Initialize user settings if they don't exist
    if (!userSettings[userId]) {
      userSettings[userId] = {};
    }
    
    // Update settings
    if (ouraToken !== undefined) userSettings[userId].ouraToken = ouraToken;
    if (openaiKey !== undefined) userSettings[userId].openaiKey = openaiKey;
    if (notifications !== undefined) userSettings[userId].notifications = notifications;
    if (autoRefresh !== undefined) userSettings[userId].autoRefresh = autoRefresh;
    if (dataRetention !== undefined) userSettings[userId].dataRetention = dataRetention;
    if (theme !== undefined) userSettings[userId].theme = theme;
    
    // Add timestamp
    userSettings[userId].updatedAt = new Date().toISOString();
    
    // Save to file
    saveUserSettings();
    
    console.log(`✅ Settings saved for user ${userId}`);
    
    res.json({
      success: true,
      message: 'Settings saved successfully',
      settings: userSettings[userId]
    });
  } catch (error) {
    console.error('Error saving user settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test Oura API connection
router.post('/test-oura', authenticateToken, async (req, res) => {
  try {
    const { ouraToken } = req.body;
    
    if (!ouraToken) {
      return res.status(400).json({ error: 'Oura token is required' });
    }
    
    console.log('🧪 Testing Oura API connection...');
    console.log('Token length:', ouraToken.length);
    console.log('Token preview:', ouraToken.substring(0, 10) + '...');
    
    // Test the Oura API connection using a simpler endpoint first
    // Use the user info endpoint which is more reliable for testing
    const response = await axios.get('https://api.ouraring.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${ouraToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000 // 15 second timeout
    });
    
    console.log('✅ Oura API test successful!');
    console.log('Response status:', response.status);
    console.log('Response data keys:', Object.keys(response.data || {}));
    
    res.json({
      success: true,
      message: 'Oura API connection successful',
      userInfo: response.data
    });
    
  } catch (error) {
    console.error('❌ Oura API test failed:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      console.error('Response data:', error.response.data);
      
      res.status(400).json({
        error: 'Oura API connection failed',
        details: error.response.data?.error || error.response.data?.message || `HTTP ${error.response.status}`,
        status: error.response.status,
        statusText: error.response.statusText
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from Oura API');
      console.error('Request details:', error.request);
      
      res.status(500).json({
        error: 'Oura API connection failed',
        details: 'No response received from Oura API - check your internet connection and try again'
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
      console.error('Error stack:', error.stack);
      
      res.status(500).json({
        error: 'Oura API connection failed',
        details: `Request setup error: ${error.message}`
      });
    }
  }
});

module.exports = router;
