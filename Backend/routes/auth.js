const express = require('express');
const router = express.Router();
const UserService = require('../services/UserService');
const SessionService = require('../services/SessionService');
const jwt = require('jsonwebtoken');

// Helper to extract client info from request
const getClientInfo = (req) => {
  return {
    ip_address: req.headers['x-forwarded-for']?.split(',')[0] || req.connection?.remoteAddress || req.ip || '0.0.0.0',
    mac_address: req.headers['x-mac-address'] || null,
    device_name: req.headers['x-device-name'] || 'Unknown Device',
    operating_system: req.headers['x-os'] || extractOS(req.headers['user-agent']),
    browser_user_agent: req.headers['user-agent'] || 'Unknown',
    city: req.headers['x-city'] || null,
    country: req.headers['x-country'] || null
  };
};

// Helper to extract OS from user agent
const extractOS = (userAgent) => {
  if (!userAgent) return 'Unknown';
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
  return 'Unknown';
};

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const timestamp = new Date().toISOString();
    const clientInfo = getClientInfo(req);
    
    console.log(`\n🔐 [POST /api/v1/auth/login] Login Route Called`);
    console.log(`⏰ Timestamp: ${timestamp}`);
    console.log(`📧 Email: ${email}`);
    console.log(`🌐 IP: ${clientInfo.ip_address}`);

    // Validate input
    if (!email || !password) {
      console.error(`❌ Validation Failed - Missing email or password`);
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error(`❌ Invalid email format: ${email}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    console.log(`✅ Input validation passed`);
    console.log(`🔄 Authenticating user...`);

    // Check demo credentials first
    const demoCredentials = {
      'admin@digious.com': { password: 'admin123', role: 'admin', name: 'Admin User', id: 1 },
      'hr@digious.com': { password: 'hr123', role: 'hr', name: 'HR User', id: 2 },
      'employee@digious.com': { password: 'emp123', role: 'employee', name: 'Employee User', id: 3 }
    };

    if (demoCredentials[email]) {
      const demo = demoCredentials[email];
      if (password === demo.password) {
        console.log(`✅ Demo credentials authenticated`);
        
        // Create session for demo user
        let session = null;
        try {
          session = await SessionService.createSession(demo.id, {
            ...clientInfo,
            email: email
          });
          console.log(`✅ Session created: ${session.id}`);
        } catch (sessionError) {
          console.log(`⚠️ Session creation skipped: ${sessionError.message}`);
        }
        
        const token = jwt.sign(
          {
            id: demo.id,
            email: email,
            role: demo.role,
            employeeId: null,
            sessionId: session?.id || null
          },
          process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production',
          { expiresIn: process.env.JWT_EXPIRE || '1d' }
        );

        console.log(`🎫 JWT token generated successfully`);

        return res.status(200).json({
          success: true,
          message: 'Login successful',
          data: {
            token: token,
            sessionToken: session?.session_token || null,
            user: {
              id: demo.id,
              email: email,
              name: demo.name,
              role: demo.role,
              requestPasswordChange: false,
              isDemo: true
            },
            session: session ? {
              id: session.id,
              ip_address: session.ip_address,
              device_name: session.device_name,
              login_time: session.login_time
            } : null
          }
        });
      } else {
        console.error(`❌ Invalid demo credentials`);
        // Log failed attempt
        try {
          await SessionService.logLoginAttempt(null, email, clientInfo, false, 'Invalid password');
        } catch (e) {}
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
    }

    // Authenticate user with database
    const user = await UserService.loginUser(email, password);

    console.log(`✅ User authenticated successfully`);
    
    // Create session for database user
    let session = null;
    try {
      session = await SessionService.createSession(user.id, {
        ...clientInfo,
        email: email
      });
      console.log(`✅ Session created: ${session.id}`);
    } catch (sessionError) {
      console.log(`⚠️ Session creation skipped: ${sessionError.message}`);
    }
    
    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        sessionId: session?.id || null
      },
      process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production',
      { expiresIn: process.env.JWT_EXPIRE || '1d' }
    );

    console.log(`🎫 JWT token generated successfully`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token: token,
        sessionToken: session?.session_token || null,
        user: user,
        session: session ? {
          id: session.id,
          ip_address: session.ip_address,
          device_name: session.device_name,
          login_time: session.login_time
        } : null
      }
    });
  } catch (error) {
    console.error(`❌ Login Error:`, error.message);
    
    // Log failed attempt
    try {
      const clientInfo = getClientInfo(req);
      await SessionService.logLoginAttempt(null, req.body.email, clientInfo, false, error.message);
    } catch (e) {}
    
    // Determine appropriate status code
    const statusCode = error.message.includes('Invalid email or password') ? 401 : 500;
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Login failed',
      error: error.message
    });
  }
});

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and name are required'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // TODO: Implement actual user creation logic with database
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        email: email,
        name: name,
        role: role || 'employee'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Signup failed',
      error: error.message
    });
  }
});

// Change password route
router.post('/change-password', async (req, res) => {
  try {
    const { userId, oldPassword, newPassword, confirmPassword } = req.body;
    const timestamp = new Date().toISOString();
    
    console.log(`\n🔐 [POST /api/v1/auth/change-password] Change Password Route Called`);
    console.log(`⏰ Timestamp: ${timestamp}`);
    console.log(`👤 User ID: ${userId}`);

    // Validate input
    if (!userId || !oldPassword || !newPassword) {
      console.error(`❌ Validation Failed - Missing required fields`);
      return res.status(400).json({
        success: false,
        message: 'User ID, old password, and new password are required'
      });
    }

    // Validate password match
    if (newPassword !== confirmPassword) {
      console.error(`❌ New passwords do not match`);
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match'
      });
    }

    // Validate password length
    if (newPassword.length < 8) {
      console.error(`❌ Password too short`);
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }

    console.log(`✅ Input validation passed`);
    console.log(`🔄 Changing password...`);

    // Change password
    const result = await UserService.changePassword(userId, oldPassword, newPassword);

    console.log(`✅ Password changed successfully`);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      data: result
    });
  } catch (error) {
    console.error(`❌ Password Change Error:`, error.message);
    
    const statusCode = error.message.includes('incorrect') || error.message.includes('not found') ? 401 : 500;
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Password change failed',
      error: error.message
    });
  }
});

// Logout route
router.post('/logout', async (req, res) => {
  try {
    const { session_token, reason } = req.body;
    
    console.log(`\n🔐 [POST /api/v1/auth/logout] Logout Route Called`);
    
    // End session if session token provided
    if (session_token) {
      try {
        await SessionService.endSession(session_token, reason || 'User logout');
        console.log(`✅ Session ended successfully`);
      } catch (sessionError) {
        console.log(`⚠️ Session end skipped: ${sessionError.message}`);
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message
    });
  }
});

// Refresh token route
router.post('/refresh-token', (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // TODO: Implement actual token refresh logic
    res.status(200).json({
      success: true,
      message: 'Token refreshed',
      data: {
        token: 'new_jwt_token'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Token refresh failed',
      error: error.message
    });
  }
});

module.exports = router;
