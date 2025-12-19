const express = require('express');
const router = express.Router();
const SessionService = require('../services/SessionService');
const authMiddleware = require('../middleware/auth');

// Get all active sessions (admin)
router.get('/active', async (req, res) => {
  try {
    console.log(`\n🔐 [GET /api/v1/sessions/active] Get all active sessions`);
    
    const sessions = await SessionService.getAllActiveSessions();
    
    res.status(200).json({
      success: true,
      message: 'Active sessions retrieved successfully',
      data: sessions
    });
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get user's sessions
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit } = req.query;
    console.log(`\n🔐 [GET /api/v1/sessions/user/${userId}] Get user sessions`);
    
    const sessions = await SessionService.getUserSessions(userId, limit || 50);
    
    res.status(200).json({
      success: true,
      message: 'User sessions retrieved successfully',
      data: sessions
    });
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get user's active session
router.get('/user/:userId/active', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`\n🔐 [GET /api/v1/sessions/user/${userId}/active] Get active session`);
    
    const session = await SessionService.getActiveSession(userId);
    
    res.status(200).json({
      success: true,
      message: session ? 'Active session found' : 'No active session',
      data: session
    });
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// End session (logout)
router.post('/logout', async (req, res) => {
  try {
    const { session_token, reason } = req.body;
    console.log(`\n🔐 [POST /api/v1/sessions/logout] Logout session`);
    
    if (!session_token) {
      return res.status(400).json({
        success: false,
        message: 'Session token is required'
      });
    }
    
    const session = await SessionService.endSession(session_token, reason || 'User logout');
    
    res.status(200).json({
      success: true,
      message: 'Session ended successfully',
      data: session
    });
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Force end all sessions for a user (admin)
router.post('/force-logout/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    console.log(`\n🔐 [POST /api/v1/sessions/force-logout/${userId}] Force logout`);
    
    const sessions = await SessionService.forceEndAllSessions(userId, reason || 'Admin forced logout');
    
    res.status(200).json({
      success: true,
      message: `Ended ${sessions.length} sessions`,
      data: sessions
    });
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Validate session
router.post('/validate', async (req, res) => {
  try {
    const { session_token } = req.body;
    console.log(`\n🔐 [POST /api/v1/sessions/validate] Validate session`);
    
    if (!session_token) {
      return res.status(400).json({
        success: false,
        message: 'Session token is required'
      });
    }
    
    const session = await SessionService.validateSession(session_token);
    
    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Session is valid',
      data: session
    });
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get suspicious activities
router.get('/suspicious', async (req, res) => {
  try {
    const { user_id, resolved } = req.query;
    console.log(`\n🚨 [GET /api/v1/sessions/suspicious] Get suspicious activities`);
    
    const resolvedBool = resolved === 'true' ? true : resolved === 'false' ? false : null;
    const alerts = await SessionService.getSuspiciousActivities(user_id, resolvedBool);
    
    res.status(200).json({
      success: true,
      message: 'Suspicious activities retrieved successfully',
      data: alerts
    });
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Resolve suspicious activity (admin)
router.put('/suspicious/:alertId/resolve', async (req, res) => {
  try {
    const { alertId } = req.params;
    const { admin_id, admin_action, admin_notes } = req.body;
    console.log(`\n🚨 [PUT /api/v1/sessions/suspicious/${alertId}/resolve] Resolve alert`);
    
    const alert = await SessionService.resolveSuspiciousActivity(
      alertId, admin_id, admin_action, admin_notes
    );
    
    res.status(200).json({
      success: true,
      message: 'Alert resolved successfully',
      data: alert
    });
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Add IP to whitelist
router.post('/whitelist', async (req, res) => {
  try {
    const { user_id, ip_address, ip_label } = req.body;
    console.log(`\n🔐 [POST /api/v1/sessions/whitelist] Add IP to whitelist`);
    
    if (!user_id || !ip_address) {
      return res.status(400).json({
        success: false,
        message: 'User ID and IP address are required'
      });
    }
    
    const whitelistEntry = await SessionService.addToWhitelist(user_id, ip_address, ip_label);
    
    res.status(201).json({
      success: true,
      message: 'IP added to whitelist successfully',
      data: whitelistEntry
    });
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get user's IP whitelist
router.get('/whitelist/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`\n🔐 [GET /api/v1/sessions/whitelist/${userId}] Get whitelist`);
    
    const whitelist = await SessionService.getWhitelist(userId);
    
    res.status(200).json({
      success: true,
      message: 'Whitelist retrieved successfully',
      data: whitelist
    });
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
