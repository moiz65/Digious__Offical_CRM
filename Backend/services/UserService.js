const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class UserService {
  // Create user from employee onboarding data
  static async createUserFromEmployee(employeeData) {
    const timestamp = new Date().toISOString();
    console.log(`\n👤 [UserService.createUserFromEmployee] Service Method Called`);
    console.log(`⏰ Timestamp: ${timestamp}`);
    
    const {
      email,
      password,
      requestPasswordChange,
      name
    } = employeeData;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(`🔐 Password hashed successfully`);

    // Get the employee ID from the employees table
    try {
      const employeeQuery = `SELECT id FROM employees WHERE email = $1`;
      const employeeResult = await pool.query(employeeQuery, [email]);
      
      if (employeeResult.rows.length === 0) {
        throw new Error('Employee not found in employees table');
      }

      const employeeId = employeeResult.rows[0].id;
      console.log(`📊 Employee ID: ${employeeId}`);

      // Determine role based on department (HR onboarded users default to 'employee')
      const role = 'employee';

      // Create user record
      const userQuery = `
        INSERT INTO users (
          employee_id,
          email,
          password,
          role,
          request_password_change,
          is_active
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, employee_id, email, role, request_password_change, is_active, created_at;
      `;

      const userValues = [
        employeeId,
        email,
        hashedPassword,
        role,
        requestPasswordChange || false,
        true
      ];

      console.log(`📋 Creating user record in database...`);
      const result = await pool.query(userQuery, userValues);

      if (result.rows.length === 0) {
        throw new Error('Failed to create user record');
      }

      console.log(`✅ User Created Successfully`);
      console.log(`📊 User Record:`, JSON.stringify(result.rows[0], null, 2));

      return result.rows[0];
    } catch (error) {
      console.error(`❌ Error Creating User:`, error.message);
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  // Login user
  static async loginUser(email, password) {
    const timestamp = new Date().toISOString();
    console.log(`\n🔓 [UserService.loginUser] Service Method Called`);
    console.log(`⏰ Timestamp: ${timestamp}`);
    console.log(`📧 Email: ${email}`);

    try {
      // Query to get user with employee details
      const query = `
        SELECT 
          u.id,
          u.employee_id,
          u.email,
          u.password,
          u.role,
          u.request_password_change,
          u.is_active,
          e.name,
          e.department,
          e.position,
          e.phone
        FROM users u
        LEFT JOIN employees e ON u.employee_id = e.id
        WHERE u.email = $1 AND u.is_active = true;
      `;

      console.log(`🔍 Querying user from database...`);
      const result = await pool.query(query, [email]);

      if (result.rows.length === 0) {
        console.log(`❌ User not found or inactive`);
        throw new Error('Invalid email or password');
      }

      const user = result.rows[0];
      console.log(`📊 User Found:`, JSON.stringify({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }, null, 2));

      // Compare password
      console.log(`🔐 Verifying password...`);
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        console.error(`❌ Password does not match`);
        // Log failed login attempt
        await this.logLoginAttempt(email, user.id, false, 'Invalid password');
        throw new Error('Invalid email or password');
      }

      console.log(`✅ Password verified successfully`);

      // Update last login
      const updateQuery = `
        UPDATE users 
        SET last_login = CURRENT_TIMESTAMP 
        WHERE id = $1
        RETURNING *;
      `;

      await pool.query(updateQuery, [user.id]);
      console.log(`📝 Last login updated`);

      // Log successful login
      await this.logLoginAttempt(email, user.id, true, null);

      // Return user data (without password)
      const userData = {
        id: user.id,
        employeeId: user.employee_id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        position: user.position,
        phone: user.phone,
        requestPasswordChange: user.request_password_change
      };

      console.log(`✅ Login Successful for user: ${email}`);
      return userData;
    } catch (error) {
      console.error(`❌ Login Error:`, error.message);
      throw error;
    }
  }

  // Change password
  static async changePassword(userId, oldPassword, newPassword) {
    const timestamp = new Date().toISOString();
    console.log(`\n🔐 [UserService.changePassword] Service Method Called`);
    console.log(`⏰ Timestamp: ${timestamp}`);
    console.log(`👤 User ID: ${userId}`);

    try {
      // Get user's current password
      const userQuery = `SELECT password, email FROM users WHERE id = $1`;
      const userResult = await pool.query(userQuery, [userId]);

      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = userResult.rows[0];

      // Verify old password
      const passwordMatch = await bcrypt.compare(oldPassword, user.password);
      if (!passwordMatch) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Store old password in history
      const historyQuery = `
        INSERT INTO password_history (user_id, old_password_hash, changed_by)
        VALUES ($1, $2, $3);
      `;
      await pool.query(historyQuery, [userId, user.password, user.email]);

      // Update password
      const updateQuery = `
        UPDATE users 
        SET password = $1, request_password_change = false, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2
        RETURNING id, email, role;
      `;

      const result = await pool.query(updateQuery, [hashedNewPassword, userId]);

      console.log(`✅ Password Changed Successfully`);
      return result.rows[0];
    } catch (error) {
      console.error(`❌ Password Change Error:`, error.message);
      throw error;
    }
  }

  // Log login attempt
  static async logLoginAttempt(email, userId, success, failureReason = null) {
    try {
      const query = `
        INSERT INTO login_audit (user_id, email, success, failure_reason)
        VALUES ($1, $2, $3, $4);
      `;
      await pool.query(query, [userId || null, email, success, failureReason]);
    } catch (error) {
      console.error(`⚠️ Failed to log login attempt:`, error.message);
      // Don't throw - logging failure shouldn't break login
    }
  }

  // Get user by email
  static async getUserByEmail(email) {
    const query = `
      SELECT 
        u.id,
        u.employee_id,
        u.email,
        u.role,
        u.request_password_change,
        u.is_active,
        e.name,
        e.department,
        e.position
      FROM users u
      LEFT JOIN employees e ON u.employee_id = e.id
      WHERE u.email = $1;
    `;

    try {
      const result = await pool.query(query, [email]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
  }

  // Get user by ID
  static async getUserById(userId) {
    const query = `
      SELECT 
        u.id,
        u.employee_id,
        u.email,
        u.role,
        u.request_password_change,
        u.is_active,
        u.last_login,
        e.name,
        e.department,
        e.position
      FROM users u
      LEFT JOIN employees e ON u.employee_id = e.id
      WHERE u.id = $1;
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
  }
}

module.exports = UserService;
