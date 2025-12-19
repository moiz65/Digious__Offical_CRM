const express = require('express');
const router = express.Router();
const CompanyRulesService = require('../services/CompanyRulesService');
const authMiddleware = require('../middleware/auth');

// Get all company rules
router.get('/', async (req, res) => {
  try {
    console.log(`\n📋 [GET /api/v1/company-rules] Get all rules`);
    
    const rules = await CompanyRulesService.getAllRules();
    
    res.status(200).json({
      success: true,
      message: 'Company rules retrieved successfully',
      data: rules
    });
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get active company rule
router.get('/active', async (req, res) => {
  try {
    console.log(`\n📋 [GET /api/v1/company-rules/active] Get active rule`);
    
    const rule = await CompanyRulesService.getActiveRule();
    
    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'No active company rule found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Active company rule retrieved successfully',
      data: rule
    });
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get rule by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`\n📋 [GET /api/v1/company-rules/${id}] Get rule by ID`);
    
    const rule = await CompanyRulesService.getRuleById(id);
    
    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Company rule not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Company rule retrieved successfully',
      data: rule
    });
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create new company rule (admin only)
router.post('/', async (req, res) => {
  try {
    console.log(`\n📋 [POST /api/v1/company-rules] Create new rule`);
    
    const ruleData = req.body;
    
    if (!ruleData.rule_name) {
      return res.status(400).json({
        success: false,
        message: 'Rule name is required'
      });
    }
    
    const rule = await CompanyRulesService.createRule(ruleData);
    
    res.status(201).json({
      success: true,
      message: 'Company rule created successfully',
      data: rule
    });
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update company rule (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`\n📋 [PUT /api/v1/company-rules/${id}] Update rule`);
    
    const ruleData = req.body;
    const changedBy = req.body.changed_by || 'Admin';
    
    const rule = await CompanyRulesService.updateRule(id, ruleData, changedBy);
    
    res.status(200).json({
      success: true,
      message: 'Company rule updated successfully',
      data: rule
    });
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Check if time is late
router.get('/check/late', async (req, res) => {
  try {
    const { time } = req.query;
    console.log(`\n📋 [GET /api/v1/company-rules/check/late] Check if ${time} is late`);
    
    const checkTime = time || new Date().toISOString();
    const isLate = await CompanyRulesService.isLate(checkTime);
    
    res.status(200).json({
      success: true,
      data: {
        time: checkTime,
        is_late: isLate
      }
    });
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Check if today is working day
router.get('/check/working-day', async (req, res) => {
  try {
    const { date } = req.query;
    console.log(`\n📋 [GET /api/v1/company-rules/check/working-day] Check working day`);
    
    const checkDate = date ? new Date(date) : new Date();
    const isWorkingDay = await CompanyRulesService.isWorkingDay(checkDate);
    
    res.status(200).json({
      success: true,
      data: {
        date: checkDate.toISOString(),
        day: checkDate.toLocaleDateString('en-US', { weekday: 'long' }),
        is_working_day: isWorkingDay
      }
    });
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get rule change history
router.get('/:id/history', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`\n📋 [GET /api/v1/company-rules/${id}/history] Get rule history`);
    
    const history = await CompanyRulesService.getRuleHistory(id);
    
    res.status(200).json({
      success: true,
      message: 'Rule history retrieved successfully',
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

module.exports = router;
