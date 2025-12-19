const pool = require('../config/database');

class BreakService {
  // Get all break types
  static async getAllBreakTypes() {
    console.log(`\n☕ [BreakService.getAllBreakTypes] Getting all break types`);
    
    try {
      const query = `
        SELECT * FROM break_types
        WHERE is_active = true
        ORDER BY break_name;
      `;
      
      const result = await pool.query(query);
      console.log(`✅ Found ${result.rows.length} break types`);
      return result.rows;
    } catch (error) {
      console.error(`❌ Error getting break types:`, error.message);
      throw new Error(`Failed to get break types: ${error.message}`);
    }
  }

  // Get break type by ID
  static async getBreakTypeById(breakTypeId) {
    console.log(`\n☕ [BreakService.getBreakTypeById] Getting break type ID: ${breakTypeId}`);
    
    try {
      const query = `SELECT * FROM break_types WHERE id = $1;`;
      const result = await pool.query(query, [breakTypeId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      console.error(`❌ Error getting break type:`, error.message);
      throw new Error(`Failed to get break type: ${error.message}`);
    }
  }

  // Create new break type
  static async createBreakType(breakData) {
    console.log(`\n☕ [BreakService.createBreakType] Creating break type: ${breakData.break_name}`);
    
    try {
      const query = `
        INSERT INTO break_types (
          break_name, break_description, duration_minutes,
          is_paid, is_mandatory, requires_approval,
          earliest_start_time, latest_end_time,
          allowed_per_day, allowed_per_week, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *;
      `;
      
      const values = [
        breakData.break_name,
        breakData.break_description || null,
        breakData.duration_minutes,
        breakData.is_paid || false,
        breakData.is_mandatory || false,
        breakData.requires_approval || false,
        breakData.earliest_start_time || null,
        breakData.latest_end_time || null,
        breakData.allowed_per_day || 1,
        breakData.allowed_per_week || null,
        breakData.is_active !== false
      ];
      
      const result = await pool.query(query, values);
      console.log(`✅ Break type created: ${result.rows[0].break_name}`);
      return result.rows[0];
    } catch (error) {
      console.error(`❌ Error creating break type:`, error.message);
      throw new Error(`Failed to create break type: ${error.message}`);
    }
  }

  // Update break type
  static async updateBreakType(breakTypeId, breakData) {
    console.log(`\n☕ [BreakService.updateBreakType] Updating break type ID: ${breakTypeId}`);
    
    try {
      const updateFields = [];
      const values = [];
      let paramIndex = 1;
      
      const allowedFields = [
        'break_name', 'break_description', 'duration_minutes',
        'is_paid', 'is_mandatory', 'requires_approval',
        'earliest_start_time', 'latest_end_time',
        'allowed_per_day', 'allowed_per_week', 'is_active'
      ];
      
      for (const field of allowedFields) {
        if (breakData[field] !== undefined) {
          updateFields.push(`${field} = $${paramIndex}`);
          values.push(breakData[field]);
          paramIndex++;
        }
      }
      
      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(breakTypeId);
      
      const query = `
        UPDATE break_types
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *;
      `;
      
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('Break type not found');
      }
      
      console.log(`✅ Break type updated`);
      return result.rows[0];
    } catch (error) {
      console.error(`❌ Error updating break type:`, error.message);
      throw new Error(`Failed to update break type: ${error.message}`);
    }
  }

  // Start a break
  static async startBreak(userId, breakTypeId, sessionId = null, notes = null) {
    console.log(`\n☕ [BreakService.startBreak] Starting break for user ID: ${userId}`);
    console.log(`📋 Parameters:`, { userId, breakTypeId, sessionId, notes });
    
    try {
      // Check if user already has an active break
      const activeBreakQuery = `
        SELECT * FROM employee_breaks
        WHERE user_id = $1 AND break_status = 'in_progress';
      `;
      console.log(`🔍 Checking active breaks...`);
      const activeBreak = await pool.query(activeBreakQuery, [userId]);
      console.log(`📊 Active breaks found: ${activeBreak.rows.length}`);
      
      if (activeBreak.rows.length > 0) {
        console.error(`⚠️ User already has active break:`, activeBreak.rows[0]);
        throw new Error('You already have an active break. Please end it first.');
      }
      
      // Check daily break limit
      console.log(`🔍 Fetching break type ID: ${breakTypeId}...`);
      const breakType = await this.getBreakTypeById(breakTypeId);
      if (!breakType) {
        console.error(`❌ Break type not found: ${breakTypeId}`);
        throw new Error('Break type not found');
      }
      console.log(`✅ Break type found:`, { id: breakType.id, name: breakType.break_name, allowed_per_day: breakType.allowed_per_day });
      
      const todayBreaksQuery = `
        SELECT COUNT(*) as count FROM employee_breaks
        WHERE user_id = $1 
          AND break_type_id = $2 
          AND DATE(break_start_time) = CURRENT_DATE;
      `;
      console.log(`🔍 Counting today's breaks for user ${userId}, break type ${breakTypeId}...`);
      const todayBreaks = await pool.query(todayBreaksQuery, [userId, breakTypeId]);
      const breakCount = parseInt(todayBreaks.rows[0].count);
      console.log(`📊 Today's breaks: ${breakCount}/${breakType.allowed_per_day}`);
      
      if (breakCount >= breakType.allowed_per_day) {
        console.error(`❌ Daily limit reached: ${breakCount}/${breakType.allowed_per_day}`);
        throw new Error(`You have reached the daily limit for ${breakType.break_name}`);
      }
      
      // Create break record
      const query = `
        INSERT INTO employee_breaks (
          user_id, session_id, break_type_id,
          break_start_time, break_status, break_notes
        ) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, 'in_progress', $4)
        RETURNING *;
      `;
      console.log(`🗄️  Executing INSERT query:`, { user_id: userId, session_id: sessionId, break_type_id: breakTypeId });
      const result = await pool.query(query, [userId, sessionId, breakTypeId, notes]);
      
      console.log(`✅ Break record created:`, {
        id: result.rows[0].id,
        user_id: result.rows[0].user_id,
        break_type_id: result.rows[0].break_type_id,
        break_status: result.rows[0].break_status,
        break_start_time: result.rows[0].break_start_time
      });
      
      return {
        ...result.rows[0],
        break_name: breakType.break_name,
        allowed_duration: breakType.duration_minutes
      };
    } catch (error) {
      console.error(`❌ Error starting break:`, error.message);
      console.error(`📋 Full error:`, error);
      throw new Error(error.message);
    }
  }

  // End a break
  static async endBreak(userId, breakId = null) {
    console.log(`\n☕ [BreakService.endBreak] Ending break for user ID: ${userId}`);
    console.log(`📋 Parameters:`, { userId, breakId });
    
    try {
      let query;
      let values;
      
      if (breakId) {
        query = `
          UPDATE employee_breaks
          SET 
            break_end_time = CURRENT_TIMESTAMP,
            actual_break_duration_minutes = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - break_start_time)) / 60,
            break_status = CASE 
              WHEN EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - break_start_time)) / 60 > 
                (SELECT duration_minutes FROM break_types WHERE id = break_type_id)
              THEN 'exceeded'
              ELSE 'completed'
            END,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $1 AND user_id = $2 AND break_status = 'in_progress'
          RETURNING *;
        `;
        values = [breakId, userId];
        console.log(`🔍 Ending specific break ID: ${breakId}`);
      } else {
        // End current active break
        query = `
          UPDATE employee_breaks
          SET 
            break_end_time = CURRENT_TIMESTAMP,
            actual_break_duration_minutes = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - break_start_time)) / 60,
            break_status = CASE 
              WHEN EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - break_start_time)) / 60 > 
                (SELECT duration_minutes FROM break_types WHERE id = break_type_id)
              THEN 'exceeded'
              ELSE 'completed'
            END,
            updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $1 AND break_status = 'in_progress'
          RETURNING *;
        `;
        values = [userId];
      }
      
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('No active break found');
      }
      
      // Update daily summary
      await this.updateDailyBreakSummary(userId);
      
      console.log(`✅ Break ended. Duration: ${Math.round(result.rows[0].actual_break_duration_minutes)} minutes`);
      return result.rows[0];
    } catch (error) {
      console.error(`❌ Error ending break:`, error.message);
      throw new Error(`Failed to end break: ${error.message}`);
    }
  }

  // Get user's current active break
  static async getActiveBreak(userId) {
    console.log(`\n☕ [BreakService.getActiveBreak] Getting active break for user ID: ${userId}`);
    
    try {
      const query = `
        SELECT eb.*, bt.break_name, bt.duration_minutes as allowed_duration
        FROM employee_breaks eb
        JOIN break_types bt ON eb.break_type_id = bt.id
        WHERE eb.user_id = $1 AND eb.break_status = 'in_progress';
      `;
      
      const result = await pool.query(query, [userId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      // Calculate current duration
      const startTime = new Date(result.rows[0].break_start_time);
      const currentDuration = Math.round((Date.now() - startTime.getTime()) / 60000);
      
      return {
        ...result.rows[0],
        current_duration_minutes: currentDuration,
        is_exceeded: currentDuration > result.rows[0].allowed_duration
      };
    } catch (error) {
      console.error(`❌ Error getting active break:`, error.message);
      throw new Error(`Failed to get active break: ${error.message}`);
    }
  }

  // Get user's breaks for today
  static async getTodayBreaks(userId) {
    console.log(`\n☕ [BreakService.getTodayBreaks] Getting today's breaks for user ID: ${userId}`);
    
    try {
      const query = `
        SELECT eb.*, bt.break_name, bt.duration_minutes as allowed_duration
        FROM employee_breaks eb
        JOIN break_types bt ON eb.break_type_id = bt.id
        WHERE eb.user_id = $1 AND DATE(eb.break_start_time) = CURRENT_DATE
        ORDER BY eb.break_start_time DESC;
      `;
      
      const result = await pool.query(query, [userId]);
      console.log(`✅ Found ${result.rows.length} breaks today`);
      return result.rows;
    } catch (error) {
      console.error(`❌ Error getting today's breaks:`, error.message);
      throw new Error(`Failed to get today's breaks: ${error.message}`);
    }
  }

  // Get user's break history
  static async getBreakHistory(userId, startDate = null, endDate = null, limit = 100) {
    console.log(`\n☕ [BreakService.getBreakHistory] Getting break history for user ID: ${userId}`);
    
    try {
      let query = `
        SELECT eb.*, bt.break_name, bt.duration_minutes as allowed_duration
        FROM employee_breaks eb
        JOIN break_types bt ON eb.break_type_id = bt.id
        WHERE eb.user_id = $1
      `;
      const values = [userId];
      let paramIndex = 2;
      
      if (startDate) {
        query += ` AND DATE(eb.break_start_time) >= $${paramIndex}`;
        values.push(startDate);
        paramIndex++;
      }
      
      if (endDate) {
        query += ` AND DATE(eb.break_start_time) <= $${paramIndex}`;
        values.push(endDate);
        paramIndex++;
      }
      
      query += ` ORDER BY eb.break_start_time DESC LIMIT $${paramIndex}`;
      values.push(limit);
      
      const result = await pool.query(query, values);
      console.log(`✅ Found ${result.rows.length} break records`);
      return result.rows;
    } catch (error) {
      console.error(`❌ Error getting break history:`, error.message);
      throw new Error(`Failed to get break history: ${error.message}`);
    }
  }

  // Update daily break summary
  static async updateDailyBreakSummary(userId, date = null) {
    console.log(`\n☕ [BreakService.updateDailyBreakSummary] Updating summary for user ID: ${userId}`);
    
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      
      // Get all breaks for the day
      const breaksQuery = `
        SELECT 
          SUM(COALESCE(actual_break_duration_minutes, 0)) as total_time,
          COUNT(*) as total_count,
          COUNT(CASE WHEN bt.break_name = 'Smoke Break' THEN 1 END) as smoke_count,
          COUNT(CASE WHEN bt.break_name = 'Dinner Break' THEN 1 END) as dinner_count,
          COUNT(CASE WHEN bt.break_name = 'Washroom Break' THEN 1 END) as washroom_count,
          COUNT(CASE WHEN bt.break_name = 'Prayer Break' THEN 1 END) as prayer_count
        FROM employee_breaks eb
        JOIN break_types bt ON eb.break_type_id = bt.id
        WHERE eb.user_id = $1 
          AND DATE(eb.break_start_time) = $2
          AND eb.break_status IN ('completed', 'exceeded');
      `;
      
      const breaksResult = await pool.query(breaksQuery, [userId, targetDate]);
      const breaks = breaksResult.rows[0];
      
      // Get break policy total time
      const policyQuery = `
        SELECT total_break_time_minutes FROM break_policies WHERE is_active = true LIMIT 1;
      `;
      const policyResult = await pool.query(policyQuery);
      const policyLimit = policyResult.rows[0]?.total_break_time_minutes || 82;
      
      const totalTime = parseInt(breaks.total_time) || 0;
      const exceedsLimit = totalTime > policyLimit;
      
      // Upsert daily summary
      const upsertQuery = `
        INSERT INTO daily_break_summary (
          user_id, break_date, total_break_time_minutes, total_breaks_taken,
          smoke_breaks, dinner_breaks, washroom_breaks, prayer_breaks,
          is_compliant, exceeds_limit
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (user_id, break_date) 
        DO UPDATE SET
          total_break_time_minutes = $3,
          total_breaks_taken = $4,
          smoke_breaks = $5,
          dinner_breaks = $6,
          washroom_breaks = $7,
          prayer_breaks = $8,
          is_compliant = $9,
          exceeds_limit = $10,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *;
      `;
      
      const values = [
        userId,
        targetDate,
        totalTime,
        parseInt(breaks.total_count) || 0,
        parseInt(breaks.smoke_count) || 0,
        parseInt(breaks.dinner_count) || 0,
        parseInt(breaks.washroom_count) || 0,
        parseInt(breaks.prayer_count) || 0,
        !exceedsLimit,
        exceedsLimit
      ];
      
      const result = await pool.query(upsertQuery, values);
      console.log(`✅ Daily summary updated`);
      return result.rows[0];
    } catch (error) {
      console.error(`❌ Error updating daily summary:`, error.message);
      // Don't throw, just log
    }
  }

  // Get daily break summary
  static async getDailyBreakSummary(userId, date = null) {
    console.log(`\n☕ [BreakService.getDailyBreakSummary] Getting summary for user ID: ${userId}`);
    
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      
      const query = `
        SELECT * FROM daily_break_summary
        WHERE user_id = $1 AND break_date = $2;
      `;
      
      const result = await pool.query(query, [userId, targetDate]);
      
      if (result.rows.length === 0) {
        // Return default empty summary
        return {
          user_id: userId,
          break_date: targetDate,
          total_break_time_minutes: 0,
          total_breaks_taken: 0,
          smoke_breaks: 0,
          dinner_breaks: 0,
          washroom_breaks: 0,
          prayer_breaks: 0,
          is_compliant: true,
          exceeds_limit: false
        };
      }
      
      return result.rows[0];
    } catch (error) {
      console.error(`❌ Error getting daily summary:`, error.message);
      throw new Error(`Failed to get daily summary: ${error.message}`);
    }
  }

  // Get break policy
  static async getActiveBreakPolicy() {
    console.log(`\n☕ [BreakService.getActiveBreakPolicy] Getting active break policy`);
    
    try {
      const query = `
        SELECT bp.*, 
          json_agg(json_build_object(
            'id', bt.id,
            'break_name', bt.break_name,
            'duration_minutes', COALESCE(pbt.duration_minutes, bt.duration_minutes),
            'allowed_per_day', COALESCE(pbt.allowed_per_day, bt.allowed_per_day),
            'is_mandatory', COALESCE(pbt.is_mandatory_in_policy, bt.is_mandatory)
          )) as break_types
        FROM break_policies bp
        LEFT JOIN policy_break_types pbt ON bp.id = pbt.break_policy_id
        LEFT JOIN break_types bt ON pbt.break_type_id = bt.id
        WHERE bp.is_active = true
        GROUP BY bp.id
        LIMIT 1;
      `;
      
      const result = await pool.query(query);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      console.log(`✅ Active policy found: ${result.rows[0].policy_name}`);
      return result.rows[0];
    } catch (error) {
      console.error(`❌ Error getting break policy:`, error.message);
      throw new Error(`Failed to get break policy: ${error.message}`);
    }
  }

  // Get all employees' break summary for today (admin)
  static async getAllEmployeesBreakSummary(date = null) {
    console.log(`\n☕ [BreakService.getAllEmployeesBreakSummary] Getting all summaries`);
    
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      
      const query = `
        SELECT 
          dbs.*,
          u.email,
          e.name as employee_name,
          e.department
        FROM daily_break_summary dbs
        JOIN users u ON dbs.user_id = u.id
        LEFT JOIN employees e ON u.employee_id = e.id
        WHERE dbs.break_date = $1
        ORDER BY dbs.total_break_time_minutes DESC;
      `;
      
      const result = await pool.query(query, [targetDate]);
      console.log(`✅ Found ${result.rows.length} summaries`);
      return result.rows;
    } catch (error) {
      console.error(`❌ Error getting all summaries:`, error.message);
      throw new Error(`Failed to get all summaries: ${error.message}`);
    }
  }
}

module.exports = BreakService;
