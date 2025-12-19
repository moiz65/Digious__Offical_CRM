const pool = require('../config/database');
const crypto = require('crypto');

class SessionService {
  // Create new session on login
  static async createSession(userId, sessionData) {
    console.log(`\n🔐 [SessionService.createSession] Creating session for user ID: ${userId}`);
    
    const {
      ip_address,
      mac_address,
      device_name,
      operating_system,
      browser_user_agent,
      city,
      country,
      latitude,
      longitude
    } = sessionData;
    
    try {
      // Generate session token
      const sessionToken = crypto.randomBytes(64).toString('hex');
      console.log(`📝 Session token generated: ${sessionToken.substring(0, 20)}...`);
      
      // The database trigger will automatically handle single session enforcement
      const query = `
        INSERT INTO user_sessions (
          user_id, session_token, ip_address, mac_address,
          device_name, operating_system, browser_user_agent,
          login_status, is_active, is_primary_session,
          city, country, latitude, longitude
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', true, true, $8, $9, $10, $11)
        RETURNING *;
      `;
      
      const values = [
        userId,
        sessionToken,
        ip_address || '0.0.0.0',
        mac_address || null,
        device_name || 'Unknown Device',
        operating_system || 'Unknown OS',
        browser_user_agent || 'Unknown Browser',
        city || null,
        country || null,
        latitude || null,
        longitude || null
      ];
      
      console.log(`🗄️  Executing INSERT query with values:`, {
        user_id: userId,
        session_token: sessionToken.substring(0, 20) + '...',
        ip_address: values[2],
        device_name: values[4]
      });
      
      const result = await pool.query(query, values);
      
      if (!result.rows || result.rows.length === 0) {
        console.error(`❌ No rows returned from INSERT query`);
        throw new Error('Session insert returned no rows');
      }
      
      console.log(`✅ Session created successfully with ID: ${result.rows[0].id}`);
      console.log(`📊 Session record:`, {
        id: result.rows[0].id,
        user_id: result.rows[0].user_id,
        ip_address: result.rows[0].ip_address,
        device_name: result.rows[0].device_name,
        login_time: result.rows[0].login_time,
        is_active: result.rows[0].is_active
      });
      
      // Update or create active session record
      await this.updateActiveSession(userId, result.rows[0].id);
      
      // Log login attempt
      await this.logLoginAttempt(userId, sessionData.email, sessionData, true, null);
      
      // Check for suspicious activity
      await this.checkSuspiciousActivity(userId, sessionData);
      
      return result.rows[0];
    } catch (error) {
      console.error(`❌ Error creating session:`, error.message);
      console.error(`📋 Error details:`, error);
      throw new Error(`Failed to create session: ${error.message}`);
    }
  }

  // Update active session tracker
  static async updateActiveSession(userId, sessionId) {
    console.log(`\n🔐 [SessionService.updateActiveSession] Updating active session for user ID: ${userId}`);
    
    try {
      // Get previous session if exists
      const getPrevQuery = `SELECT current_session_id FROM active_user_sessions WHERE user_id = $1`;
      const prevResult = await pool.query(getPrevQuery, [userId]);
      const previousSessionId = prevResult.rows[0]?.current_session_id || null;
      
      const query = `
        INSERT INTO active_user_sessions (user_id, current_session_id, previous_session_id, updated_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          previous_session_id = active_user_sessions.current_session_id,
          current_session_id = $2,
          session_conflict_flag = CASE WHEN active_user_sessions.current_session_id != $2 THEN true ELSE false END,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *;
      `;
      
      const result = await pool.query(query, [userId, sessionId, previousSessionId]);
      console.log(`✅ Active session updated`);
      return result.rows[0];
    } catch (error) {
      console.error(`❌ Error updating active session:`, error.message);
      // Don't throw, continue with login
    }
  }

  // End session on logout
  static async endSession(sessionToken, logoutReason = 'User logout') {
    console.log(`\n🔐 [SessionService.endSession] Ending session`);
    
    try {
      const query = `
        UPDATE user_sessions
        SET 
          is_active = false,
          logout_time = CURRENT_TIMESTAMP,
          login_status = 'logged_out',
          logout_reason = $2,
          session_duration_minutes = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - login_time)) / 60
        WHERE session_token = $1 AND is_active = true
        RETURNING *;
      `;
      
      const result = await pool.query(query, [sessionToken, logoutReason]);
      
      if (result.rows.length === 0) {
        console.log(`⚠️ Session not found or already ended`);
        return null;
      }
      
      console.log(`✅ Session ended for user ID: ${result.rows[0].user_id}`);
      return result.rows[0];
    } catch (error) {
      console.error(`❌ Error ending session:`, error.message);
      throw new Error(`Failed to end session: ${error.message}`);
    }
  }

  // Force end all sessions for a user (admin action)
  static async forceEndAllSessions(userId, reason = 'Admin forced logout') {
    console.log(`\n🔐 [SessionService.forceEndAllSessions] Force ending all sessions for user ID: ${userId}`);
    
    try {
      const query = `
        UPDATE user_sessions
        SET 
          is_active = false,
          logout_time = CURRENT_TIMESTAMP,
          login_status = 'logged_out',
          is_forced_logout = true,
          logout_reason = $2,
          session_duration_minutes = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - login_time)) / 60
        WHERE user_id = $1 AND is_active = true
        RETURNING *;
      `;
      
      const result = await pool.query(query, [userId, reason]);
      console.log(`✅ Ended ${result.rows.length} sessions`);
      return result.rows;
    } catch (error) {
      console.error(`❌ Error force ending sessions:`, error.message);
      throw new Error(`Failed to force end sessions: ${error.message}`);
    }
  }

  // Get user's active session
  static async getActiveSession(userId) {
    console.log(`\n🔐 [SessionService.getActiveSession] Getting active session for user ID: ${userId}`);
    
    try {
      const query = `
        SELECT * FROM user_sessions
        WHERE user_id = $1 AND is_active = true
        ORDER BY login_time DESC
        LIMIT 1;
      `;
      
      const result = await pool.query(query, [userId]);
      
      if (result.rows.length === 0) {
        console.log(`⚠️ No active session found`);
        return null;
      }
      
      console.log(`✅ Active session found`);
      return result.rows[0];
    } catch (error) {
      console.error(`❌ Error getting active session:`, error.message);
      throw new Error(`Failed to get active session: ${error.message}`);
    }
  }

  // Get all sessions for a user
  static async getUserSessions(userId, limit = 50) {
    console.log(`\n🔐 [SessionService.getUserSessions] Getting sessions for user ID: ${userId}`);
    
    try {
      const query = `
        SELECT * FROM user_sessions
        WHERE user_id = $1
        ORDER BY login_time DESC
        LIMIT $2;
      `;
      
      const result = await pool.query(query, [userId, limit]);
      console.log(`✅ Found ${result.rows.length} sessions`);
      return result.rows;
    } catch (error) {
      console.error(`❌ Error getting user sessions:`, error.message);
      throw new Error(`Failed to get user sessions: ${error.message}`);
    }
  }

  // Update last activity
  static async updateLastActivity(sessionToken) {
    try {
      const query = `
        UPDATE user_sessions
        SET last_activity = CURRENT_TIMESTAMP
        WHERE session_token = $1 AND is_active = true
        RETURNING id;
      `;
      
      await pool.query(query, [sessionToken]);
    } catch (error) {
      console.error(`❌ Error updating last activity:`, error.message);
    }
  }

  // Log login attempt
  static async logLoginAttempt(userId, email, sessionData, success, failureReason) {
    console.log(`\n🔐 [SessionService.logLoginAttempt] Logging login attempt for: ${email}`);
    
    try {
      const query = `
        INSERT INTO login_attempts (
          user_id, email, ip_address, mac_address,
          device_name, operating_system, browser_user_agent,
          attempt_status, success, failure_reason,
          city, country
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *;
      `;
      
      const values = [
        userId,
        email,
        sessionData.ip_address || '0.0.0.0',
        sessionData.mac_address || null,
        sessionData.device_name || 'Unknown',
        sessionData.operating_system || 'Unknown',
        sessionData.browser_user_agent || 'Unknown',
        success ? 'success' : 'failed',
        success,
        failureReason,
        sessionData.city || null,
        sessionData.country || null
      ];
      
      const result = await pool.query(query, values);
      console.log(`✅ Login attempt logged`);
      return result.rows[0];
    } catch (error) {
      console.error(`❌ Error logging login attempt:`, error.message);
      // Don't throw, continue
    }
  }

  // Check for suspicious activity
  static async checkSuspiciousActivity(userId, sessionData) {
    console.log(`\n🔐 [SessionService.checkSuspiciousActivity] Checking for user ID: ${userId}`);
    
    try {
      // Get last successful login
      const lastLoginQuery = `
        SELECT ip_address, country, city, login_time
        FROM user_sessions
        WHERE user_id = $1 AND is_active = false
        ORDER BY login_time DESC
        LIMIT 1;
      `;
      
      const lastLogin = await pool.query(lastLoginQuery, [userId]);
      
      if (lastLogin.rows.length > 0) {
        const last = lastLogin.rows[0];
        
        // Check for new location (different country)
        if (sessionData.country && last.country && sessionData.country !== last.country) {
          await this.createSuspiciousActivityAlert(userId, null, {
            alert_type: 'new_location',
            alert_description: `Login from new country: ${sessionData.country} (previous: ${last.country})`,
            ip_address: sessionData.ip_address,
            previous_ip_address: last.ip_address,
            previous_country: last.country,
            current_country: sessionData.country,
            risk_level: 'high'
          });
        }
        
        // Check for different IP
        if (sessionData.ip_address && last.ip_address && sessionData.ip_address !== last.ip_address) {
          // Only alert if significantly different (different subnet)
          const currentSubnet = sessionData.ip_address.split('.').slice(0, 2).join('.');
          const lastSubnet = last.ip_address.split('.').slice(0, 2).join('.');
          
          if (currentSubnet !== lastSubnet) {
            await this.createSuspiciousActivityAlert(userId, null, {
              alert_type: 'new_device',
              alert_description: `Login from new IP subnet: ${sessionData.ip_address}`,
              ip_address: sessionData.ip_address,
              previous_ip_address: last.ip_address,
              risk_level: 'medium'
            });
          }
        }
      }
    } catch (error) {
      console.error(`❌ Error checking suspicious activity:`, error.message);
      // Don't throw, continue
    }
  }

  // Create suspicious activity alert
  static async createSuspiciousActivityAlert(userId, sessionId, alertData) {
    console.log(`\n🚨 [SessionService.createSuspiciousActivityAlert] Creating alert for user ID: ${userId}`);
    
    try {
      const query = `
        INSERT INTO suspicious_activities (
          user_id, session_id, alert_type, alert_description,
          ip_address, mac_address, previous_ip_address,
          previous_country, current_country, risk_level
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *;
      `;
      
      const values = [
        userId,
        sessionId,
        alertData.alert_type,
        alertData.alert_description,
        alertData.ip_address || null,
        alertData.mac_address || null,
        alertData.previous_ip_address || null,
        alertData.previous_country || null,
        alertData.current_country || null,
        alertData.risk_level || 'medium'
      ];
      
      const result = await pool.query(query, values);
      console.log(`🚨 Suspicious activity alert created: ${alertData.alert_type}`);
      return result.rows[0];
    } catch (error) {
      console.error(`❌ Error creating suspicious activity alert:`, error.message);
    }
  }

  // Get suspicious activities for a user
  static async getSuspiciousActivities(userId = null, resolved = null) {
    console.log(`\n🚨 [SessionService.getSuspiciousActivities] Getting alerts`);
    
    try {
      let query = `
        SELECT sa.*, u.email as user_email
        FROM suspicious_activities sa
        LEFT JOIN users u ON sa.user_id = u.id
        WHERE 1=1
      `;
      const values = [];
      let paramIndex = 1;
      
      if (userId) {
        query += ` AND sa.user_id = $${paramIndex}`;
        values.push(userId);
        paramIndex++;
      }
      
      if (resolved !== null) {
        query += ` AND sa.is_resolved = $${paramIndex}`;
        values.push(resolved);
        paramIndex++;
      }
      
      query += ` ORDER BY sa.created_at DESC LIMIT 100`;
      
      const result = await pool.query(query, values);
      console.log(`✅ Found ${result.rows.length} alerts`);
      return result.rows;
    } catch (error) {
      console.error(`❌ Error getting suspicious activities:`, error.message);
      throw new Error(`Failed to get suspicious activities: ${error.message}`);
    }
  }

  // Resolve suspicious activity
  static async resolveSuspiciousActivity(alertId, adminId, adminAction, adminNotes) {
    console.log(`\n🚨 [SessionService.resolveSuspiciousActivity] Resolving alert ID: ${alertId}`);
    
    try {
      const query = `
        UPDATE suspicious_activities
        SET 
          is_resolved = true,
          admin_action = $2,
          admin_notes = $3,
          reviewed_by = $4,
          reviewed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *;
      `;
      
      const result = await pool.query(query, [alertId, adminAction, adminNotes, adminId]);
      
      if (result.rows.length === 0) {
        throw new Error('Alert not found');
      }
      
      console.log(`✅ Alert resolved`);
      return result.rows[0];
    } catch (error) {
      console.error(`❌ Error resolving alert:`, error.message);
      throw new Error(`Failed to resolve alert: ${error.message}`);
    }
  }

  // Add/manage IP whitelist
  static async addToWhitelist(userId, ipAddress, ipLabel) {
    console.log(`\n🔐 [SessionService.addToWhitelist] Adding IP ${ipAddress} for user ID: ${userId}`);
    
    try {
      const query = `
        INSERT INTO ip_whitelist (user_id, ip_address, ip_label, is_active, is_verified)
        VALUES ($1, $2, $3, true, false)
        ON CONFLICT (user_id, ip_address) DO UPDATE
        SET ip_label = $3, is_active = true, updated_at = CURRENT_TIMESTAMP
        RETURNING *;
      `;
      
      const result = await pool.query(query, [userId, ipAddress, ipLabel]);
      console.log(`✅ IP added to whitelist`);
      return result.rows[0];
    } catch (error) {
      console.error(`❌ Error adding to whitelist:`, error.message);
      throw new Error(`Failed to add to whitelist: ${error.message}`);
    }
  }

  // Get user's IP whitelist
  static async getWhitelist(userId) {
    console.log(`\n🔐 [SessionService.getWhitelist] Getting whitelist for user ID: ${userId}`);
    
    try {
      const query = `
        SELECT * FROM ip_whitelist
        WHERE user_id = $1 AND is_active = true
        ORDER BY created_at DESC;
      `;
      
      const result = await pool.query(query, [userId]);
      console.log(`✅ Found ${result.rows.length} whitelisted IPs`);
      return result.rows;
    } catch (error) {
      console.error(`❌ Error getting whitelist:`, error.message);
      throw new Error(`Failed to get whitelist: ${error.message}`);
    }
  }

  // Validate session token
  static async validateSession(sessionToken) {
    console.log(`\n🔐 [SessionService.validateSession] Validating session`);
    
    try {
      const query = `
        SELECT us.*, u.email, u.role
        FROM user_sessions us
        JOIN users u ON us.user_id = u.id
        WHERE us.session_token = $1 AND us.is_active = true;
      `;
      
      const result = await pool.query(query, [sessionToken]);
      
      if (result.rows.length === 0) {
        console.log(`❌ Invalid or expired session`);
        return null;
      }
      
      // Update last activity
      await this.updateLastActivity(sessionToken);
      
      console.log(`✅ Session valid for user: ${result.rows[0].email}`);
      return result.rows[0];
    } catch (error) {
      console.error(`❌ Error validating session:`, error.message);
      return null;
    }
  }

  // Get all active sessions (admin)
  static async getAllActiveSessions() {
    console.log(`\n🔐 [SessionService.getAllActiveSessions] Getting all active sessions`);
    
    try {
      const query = `
        SELECT us.*, u.email, u.role, e.name as employee_name
        FROM user_sessions us
        JOIN users u ON us.user_id = u.id
        LEFT JOIN employees e ON u.employee_id = e.id
        WHERE us.is_active = true
        ORDER BY us.login_time DESC;
      `;
      
      const result = await pool.query(query);
      console.log(`✅ Found ${result.rows.length} active sessions`);
      return result.rows;
    } catch (error) {
      console.error(`❌ Error getting all active sessions:`, error.message);
      throw new Error(`Failed to get all active sessions: ${error.message}`);
    }
  }
}

module.exports = SessionService;
