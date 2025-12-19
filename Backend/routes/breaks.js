const express = require('express');
const router = express.Router();
const BreakService = require('../services/BreakService');
const authMiddleware = require('../middleware/auth');

// Get all break types
router.get('/types', async (req, res) => {
  try {
    console.log(`\n☕ [GET /api/v1/breaks/types] Get all break types`);
    
    const breakTypes = await BreakService.getAllBreakTypes();
    
    res.status(200).json({
      success: true,
      message: 'Break types retrieved successfully',
      data: breakTypes
    });
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get break type by ID
router.get('/types/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`\n☕ [GET /api/v1/breaks/types/${id}] Get break type`);
    
    const breakType = await BreakService.getBreakTypeById(id);
    
    if (!breakType) {
      return res.status(404).json({
        success: false,
        message: 'Break type not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Break type retrieved successfully',
      data: breakType
    });
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create new break type (admin)
router.post('/types', async (req, res) => {
  try {
    console.log(`\n☕ [POST /api/v1/breaks/types] Create break type`);
    
    const breakData = req.body;
    
    if (!breakData.break_name || !breakData.duration_minutes) {
      return res.status(400).json({
        success: false,
        message: 'Break name and duration are required'
      });
    }
    
    const breakType = await BreakService.createBreakType(breakData);
    
    res.status(201).json({
      success: true,
      message: 'Break type created successfully',
      data: breakType
    });
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update break type (admin)
router.put('/types/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`\n☕ [PUT /api/v1/breaks/types/${id}] Update break type`);
    
    const breakType = await BreakService.updateBreakType(id, req.body);
    
    res.status(200).json({
      success: true,
      message: 'Break type updated successfully',
      data: breakType
    });
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get active break policy
router.get('/policy', async (req, res) => {
  try {
    console.log(`\n☕ [GET /api/v1/breaks/policy] Get active break policy`);
    
    const policy = await BreakService.getActiveBreakPolicy();
    
    res.status(200).json({
      success: true,
      message: policy ? 'Break policy retrieved' : 'No active policy found',
      data: policy
    });
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Start a break
router.post('/start', async (req, res) => {
  try {
    const { user_id, break_type_id, session_id, notes } = req.body;
    console.log(`\n☕ [POST /api/v1/breaks/start] Start break`);
    
    if (!user_id || !break_type_id) {
      return res.status(400).json({
        success: false,
        message: 'User ID and break type ID are required'
      });
    }
    
    const breakRecord = await BreakService.startBreak(user_id, break_type_id, session_id, notes);
    
    res.status(201).json({
      success: true,
      message: `${breakRecord.break_name} started`,
      data: breakRecord
    });
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// End a break
router.post('/end', async (req, res) => {
  try {
    const { user_id, break_id } = req.body;
    console.log(`\n☕ [POST /api/v1/breaks/end] End break`);
    
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const breakRecord = await BreakService.endBreak(user_id, break_id);
    
    res.status(200).json({
      success: true,
      message: `Break ended. Duration: ${Math.round(breakRecord.actual_break_duration_minutes)} minutes`,
      data: breakRecord
    });
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get user's active break
router.get('/active/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`\n☕ [GET /api/v1/breaks/active/${userId}] Get active break`);
    
    const activeBreak = await BreakService.getActiveBreak(userId);
    
    res.status(200).json({
      success: true,
      message: activeBreak ? 'Active break found' : 'No active break',
      data: activeBreak
    });
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get user's breaks for today
router.get('/today/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`\n☕ [GET /api/v1/breaks/today/${userId}] Get today's breaks`);
    
    const breaks = await BreakService.getTodayBreaks(userId);
    
    res.status(200).json({
      success: true,
      message: 'Today\'s breaks retrieved',
      data: breaks
    });
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get user's break history
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { start_date, end_date, limit } = req.query;
    console.log(`\n☕ [GET /api/v1/breaks/history/${userId}] Get break history`);
    
    const history = await BreakService.getBreakHistory(userId, start_date, end_date, limit);
    
    res.status(200).json({
      success: true,
      message: 'Break history retrieved',
      data: history
    });
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get daily break summary for a user
router.get('/summary/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { date } = req.query;
    console.log(`\n☕ [GET /api/v1/breaks/summary/${userId}] Get daily summary`);
    
    const summary = await BreakService.getDailyBreakSummary(userId, date);
    
    res.status(200).json({
      success: true,
      message: 'Daily summary retrieved',
      data: summary
    });
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all employees' break summary for today (admin)
router.get('/summary-all', async (req, res) => {
  try {
    const { date } = req.query;
    console.log(`\n☕ [GET /api/v1/breaks/summary-all] Get all summaries`);
    
    const summaries = await BreakService.getAllEmployeesBreakSummary(date);
    
    res.status(200).json({
      success: true,
      message: 'All summaries retrieved',
      data: summaries
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
