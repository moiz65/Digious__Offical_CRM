const pool = require('../config/database');

class CompanyRulesService {
  // Get all company rules
  static async getAllRules() {
    console.log(`\n📋 [CompanyRulesService.getAllRules] Getting all company rules`);
    
    try {
      const query = `
        SELECT 
          id,
          rule_name,
          description,
          office_start_time,
          office_end_time,
          total_working_hours,
          late_threshold_minutes,
          late_mark_time,
          working_days_per_week,
          days_off_pattern,
          shift_type,
          night_shift_enabled,
          night_shift_start_time,
          night_shift_end_time,
          night_shift_working_hours,
          half_day_threshold_hours,
          grace_period_minutes,
          is_active,
          effective_from,
          effective_until,
          created_at,
          updated_at
        FROM company_rules
        ORDER BY is_active DESC, created_at DESC;
      `;
      
      const result = await pool.query(query);
      console.log(`✅ Found ${result.rows.length} company rules`);
      return result.rows;
    } catch (error) {
      console.error(`❌ Error getting company rules:`, error.message);
      throw new Error(`Failed to get company rules: ${error.message}`);
    }
  }

  // Get active company rule
  static async getActiveRule() {
    console.log(`\n📋 [CompanyRulesService.getActiveRule] Getting active company rule`);
    
    try {
      const query = `
        SELECT 
          id,
          rule_name,
          description,
          office_start_time,
          office_end_time,
          total_working_hours,
          late_threshold_minutes,
          late_mark_time,
          working_days_per_week,
          days_off_pattern,
          shift_type,
          night_shift_enabled,
          night_shift_start_time,
          night_shift_end_time,
          night_shift_working_hours,
          half_day_threshold_hours,
          grace_period_minutes,
          is_active,
          effective_from,
          effective_until,
          created_at,
          updated_at
        FROM company_rules
        WHERE is_active = true
        ORDER BY created_at DESC
        LIMIT 1;
      `;
      
      const result = await pool.query(query);
      
      if (result.rows.length === 0) {
        console.log(`⚠️ No active company rule found`);
        return null;
      }
      
      console.log(`✅ Active rule found: ${result.rows[0].rule_name}`);
      return result.rows[0];
    } catch (error) {
      console.error(`❌ Error getting active rule:`, error.message);
      throw new Error(`Failed to get active rule: ${error.message}`);
    }
  }

  // Get rule by ID
  static async getRuleById(ruleId) {
    console.log(`\n📋 [CompanyRulesService.getRuleById] Getting rule ID: ${ruleId}`);
    
    try {
      const query = `
        SELECT * FROM company_rules WHERE id = $1;
      `;
      
      const result = await pool.query(query, [ruleId]);
      
      if (result.rows.length === 0) {
        console.log(`⚠️ Rule not found`);
        return null;
      }
      
      console.log(`✅ Rule found: ${result.rows[0].rule_name}`);
      return result.rows[0];
    } catch (error) {
      console.error(`❌ Error getting rule:`, error.message);
      throw new Error(`Failed to get rule: ${error.message}`);
    }
  }

  // Create new company rule
  static async createRule(ruleData) {
    console.log(`\n📋 [CompanyRulesService.createRule] Creating new rule`);
    
    const {
      rule_name,
      description,
      office_start_time,
      office_end_time,
      total_working_hours,
      late_threshold_minutes,
      late_mark_time,
      working_days_per_week,
      days_off_pattern,
      shift_type,
      night_shift_enabled,
      night_shift_start_time,
      night_shift_end_time,
      night_shift_working_hours,
      half_day_threshold_hours,
      grace_period_minutes,
      is_active,
      effective_from
    } = ruleData;
    
    try {
      const query = `
        INSERT INTO company_rules (
          rule_name, description, office_start_time, office_end_time,
          total_working_hours, late_threshold_minutes, late_mark_time,
          working_days_per_week, days_off_pattern, shift_type,
          night_shift_enabled, night_shift_start_time, night_shift_end_time,
          night_shift_working_hours, half_day_threshold_hours, grace_period_minutes,
          is_active, effective_from
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING *;
      `;
      
      const values = [
        rule_name,
        description,
        office_start_time || '21:00:00',
        office_end_time || '06:00:00',
        total_working_hours || 9,
        late_threshold_minutes || 5,
        late_mark_time || '21:05:00',
        working_days_per_week || 5,
        JSON.stringify(days_off_pattern || { always_off: ['sunday'], week1_off: ['saturday'], week2_off: [] }),
        shift_type || 'night',
        night_shift_enabled !== false,
        night_shift_start_time || '21:00:00',
        night_shift_end_time || '06:00:00',
        night_shift_working_hours || 9,
        half_day_threshold_hours || 4.5,
        grace_period_minutes || 0,
        is_active !== false,
        effective_from || new Date()
      ];
      
      const result = await pool.query(query, values);
      console.log(`✅ Rule created: ${result.rows[0].rule_name}`);
      return result.rows[0];
    } catch (error) {
      console.error(`❌ Error creating rule:`, error.message);
      throw new Error(`Failed to create rule: ${error.message}`);
    }
  }

  // Update company rule
  static async updateRule(ruleId, ruleData, changedBy) {
    console.log(`\n📋 [CompanyRulesService.updateRule] Updating rule ID: ${ruleId}`);
    
    try {
      // First, get current rule for history
      const currentRule = await this.getRuleById(ruleId);
      if (!currentRule) {
        throw new Error('Rule not found');
      }
      
      // Log to history
      await this.logRuleChange(ruleId, currentRule, changedBy, ruleData.change_reason);
      
      // Build update query dynamically
      const updateFields = [];
      const values = [];
      let paramIndex = 1;
      
      const allowedFields = [
        'rule_name', 'description', 'office_start_time', 'office_end_time',
        'total_working_hours', 'late_threshold_minutes', 'late_mark_time',
        'working_days_per_week', 'days_off_pattern', 'shift_type',
        'night_shift_enabled', 'night_shift_start_time', 'night_shift_end_time',
        'night_shift_working_hours', 'half_day_threshold_hours', 'grace_period_minutes',
        'is_active', 'effective_from', 'effective_until'
      ];
      
      for (const field of allowedFields) {
        if (ruleData[field] !== undefined) {
          updateFields.push(`${field} = $${paramIndex}`);
          values.push(field === 'days_off_pattern' ? JSON.stringify(ruleData[field]) : ruleData[field]);
          paramIndex++;
        }
      }
      
      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(ruleId);
      
      const query = `
        UPDATE company_rules
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *;
      `;
      
      const result = await pool.query(query, values);
      console.log(`✅ Rule updated: ${result.rows[0].rule_name}`);
      return result.rows[0];
    } catch (error) {
      console.error(`❌ Error updating rule:`, error.message);
      throw new Error(`Failed to update rule: ${error.message}`);
    }
  }

  // Log rule change to history
  static async logRuleChange(ruleId, oldRule, changedBy, changeReason) {
    console.log(`\n📋 [CompanyRulesService.logRuleChange] Logging rule change`);
    
    try {
      const query = `
        INSERT INTO attendance_rules_history (
          company_rules_id, office_start_time, office_end_time,
          total_working_hours, late_threshold_minutes, late_mark_time,
          working_days_per_week, days_off_pattern, night_shift_enabled,
          night_shift_start_time, night_shift_end_time,
          changed_by, change_reason
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *;
      `;
      
      const values = [
        ruleId,
        oldRule.office_start_time,
        oldRule.office_end_time,
        oldRule.total_working_hours,
        oldRule.late_threshold_minutes,
        oldRule.late_mark_time,
        oldRule.working_days_per_week,
        JSON.stringify(oldRule.days_off_pattern),
        oldRule.night_shift_enabled,
        oldRule.night_shift_start_time,
        oldRule.night_shift_end_time,
        changedBy || 'System',
        changeReason || 'Rule updated'
      ];
      
      const result = await pool.query(query, values);
      console.log(`✅ Rule change logged`);
      return result.rows[0];
    } catch (error) {
      console.error(`❌ Error logging rule change:`, error.message);
      // Don't throw, just log the error
    }
  }

  // Check if time is late based on active rule
  static async isLate(checkInTime) {
    console.log(`\n📋 [CompanyRulesService.isLate] Checking if time ${checkInTime} is late`);
    
    try {
      const activeRule = await this.getActiveRule();
      if (!activeRule) {
        console.log(`⚠️ No active rule found, using default`);
        return false;
      }
      
      const lateMarkTime = activeRule.late_mark_time;
      const checkInTimeOnly = checkInTime.split('T')[1]?.substring(0, 8) || checkInTime;
      
      const isLate = checkInTimeOnly > lateMarkTime;
      console.log(`⏰ Late mark time: ${lateMarkTime}, Check-in: ${checkInTimeOnly}, Is Late: ${isLate}`);
      return isLate;
    } catch (error) {
      console.error(`❌ Error checking late:`, error.message);
      return false;
    }
  }

  // Check if today is a working day
  static async isWorkingDay(date = new Date()) {
    console.log(`\n📋 [CompanyRulesService.isWorkingDay] Checking if ${date.toISOString()} is working day`);
    
    try {
      const activeRule = await this.getActiveRule();
      if (!activeRule) {
        console.log(`⚠️ No active rule found, assuming working day`);
        return true;
      }
      
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const daysOffPattern = activeRule.days_off_pattern;
      
      // Check if Sunday (always off)
      if (daysOffPattern.always_off?.includes(dayOfWeek)) {
        console.log(`📅 ${dayOfWeek} is always off`);
        return false;
      }
      
      // Get week number of month (1-5)
      const dayOfMonth = date.getDate();
      const weekOfMonth = Math.ceil(dayOfMonth / 7);
      
      // Check week-specific days off
      if (weekOfMonth <= 2 && daysOffPattern.week1_off?.includes(dayOfWeek)) {
        console.log(`📅 ${dayOfWeek} in week ${weekOfMonth} is off`);
        return false;
      }
      
      console.log(`📅 ${dayOfWeek} is a working day`);
      return true;
    } catch (error) {
      console.error(`❌ Error checking working day:`, error.message);
      return true;
    }
  }

  // Get rule change history
  static async getRuleHistory(ruleId) {
    console.log(`\n📋 [CompanyRulesService.getRuleHistory] Getting history for rule ID: ${ruleId}`);
    
    try {
      const query = `
        SELECT * FROM attendance_rules_history
        WHERE company_rules_id = $1
        ORDER BY changed_at DESC;
      `;
      
      const result = await pool.query(query, [ruleId]);
      console.log(`✅ Found ${result.rows.length} history records`);
      return result.rows;
    } catch (error) {
      console.error(`❌ Error getting rule history:`, error.message);
      throw new Error(`Failed to get rule history: ${error.message}`);
    }
  }
}

module.exports = CompanyRulesService;
