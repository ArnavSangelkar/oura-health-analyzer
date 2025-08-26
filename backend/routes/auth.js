const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// File path for persistent user storage
const USERS_FILE = path.join(__dirname, '../data/users.json');

// Ensure data directory exists
const dataDir = path.dirname(USERS_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Load users from file or start with empty array
let users = [];
try {
  if (fs.existsSync(USERS_FILE)) {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    users = JSON.parse(data);
    console.log(`Loaded ${users.length} users from storage`);
  }
} catch (error) {
  console.error('Error loading users:', error);
  users = [];
}

// Save users to file
const saveUsers = () => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving users:', error);
  }
};

// JWT secret (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Sign up endpoint
router.post('/signup', async (req, res) => {
  try {
    console.log('=== SIGNUP REQUEST START ===');
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    console.log('Request body type:', typeof req.body);
    console.log('Request body keys:', Object.keys(req.body || {}));
    
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('Signup failed: Missing email or password');
      console.log('Email value:', email);
      console.log('Password value:', password);
      console.log('Email type:', typeof email);
      console.log('Password type:', typeof password);
      return res.status(400).json({ 
        error: 'Email and password are required',
        received: { email: !!email, password: !!password },
        body: req.body
      });
    }

    if (password.length < 6) {
      console.log('Signup failed: Password too short');
      console.log('Password length:', password.length);
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long',
        passwordLength: password.length
      });
    }

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      console.log('Signup failed: User already exists:', email);
      return res.status(400).json({ 
        error: 'User with this email already exists' 
      });
    }

    console.log('Validation passed, creating user...');

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      id: users.length + 1,
      email,
      password: hashedPassword,
      createdAt: new Date()
    };

    users.push(user);
    saveUsers(); // Save to file

    console.log('User created successfully:', { id: user.id, email: user.email });

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('=== SIGNUP REQUEST SUCCESS ===');
    res.status(201).json({
      message: 'User created successfully',
      user: { id: user.id, email: user.email },
      token
    });

  } catch (error) {
    console.error('Signup error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Sign in endpoint
router.post('/signin', async (req, res) => {
  try {
    console.log('Signin request body:', req.body);
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('Signin failed: Missing email or password');
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Find user
    const user = users.find(user => user.email === email);
    if (!user) {
      console.log('Signin failed: User not found:', email);
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('Signin failed: Invalid password for user:', email);
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    console.log('User signed in successfully:', { id: user.id, email: user.email });

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Sign in successful',
      user: { id: user.id, email: user.email },
      token
    });

  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// Get profile endpoint
router.get('/profile', (req, res) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'No token provided' 
      });
    }

    const token = authHeader.substring(7);
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    res.json({
      user: { id: user.id, email: user.email, createdAt: user.createdAt }
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(401).json({ 
      error: 'Invalid token' 
    });
  }
});

// Debug endpoint (remove in production)
router.get('/debug', (req, res) => {
  res.json({
    message: 'Auth debug info',
    totalUsers: users.length,
    users: users.map(u => ({ id: u.id, email: u.email, createdAt: u.createdAt })),
    jwtSecretSet: !!JWT_SECRET && JWT_SECRET !== 'your-secret-key',
    storageFile: USERS_FILE,
    storageFileExists: fs.existsSync(USERS_FILE)
  });
});

// Test endpoint for debugging
router.post('/test', (req, res) => {
  console.log('=== TEST ENDPOINT CALLED ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);
  console.log('Request body type:', typeof req.body);
  console.log('Content-Type header:', req.headers['content-type']);
  
  res.json({
    message: 'Test endpoint working',
    receivedBody: req.body,
    bodyType: typeof req.body,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
