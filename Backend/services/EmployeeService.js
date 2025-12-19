const pool = require('../config/database');
const UserService = require('./UserService');

class EmployeeService {
  // Create new employee
  static async createEmployee(employeeData) {
    const timestamp = new Date().toISOString();
    console.log(`\n🗄️  [EmployeeService.createEmployee] Service Method Called`);
    console.log(`⏰ Timestamp: ${timestamp}`);
    
    const {
      employeeId,
      name,
      email,
      password,
      confirmPassword,
      phone,
      department,
      position,
      designation,
      joinDate,
      baseSalary,
      address,
      emergencyContact,
      requestPasswordChange,
      bankAccount,
      taxId,
      laptop,
      laptopSerial,
      charger,
      chargerSerial,
      mouse,
      mouseSerial,
      keyboard,
      keyboardSerial,
      monitor,
      monitorSerial,
      other,
      otherName,
      otherSerial,
      resourcesNote,
      allowances,
    } = employeeData;

    const query = `
      INSERT INTO employees (
        employee_id, name, email, password, confirm_password, phone, 
        department, position, designation, join_date, base_salary, 
        address, emergency_contact, request_password_change, bank_account, 
        tax_id, laptop, laptop_serial, charger, charger_serial, mouse, 
        mouse_serial, keyboard, keyboard_serial, monitor, monitor_serial, 
        other, other_name, other_serial, resources_note, allowances, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 
        $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, 
        $29, $30, $31, $32
      )
      RETURNING *;
    `;

    const allowancesJson = JSON.stringify(allowances || []);
    
    const values = [
      employeeId,
      name,
      email,
      password,
      confirmPassword,
      phone,
      department,
      position,
      designation,
      joinDate,
      baseSalary,
      address,
      emergencyContact,
      requestPasswordChange,
      bankAccount,
      taxId,
      laptop,
      laptopSerial,
      charger,
      chargerSerial,
      mouse,
      mouseSerial,
      keyboard,
      keyboardSerial,
      monitor,
      monitorSerial,
      other,
      otherName,
      otherSerial,
      resourcesNote,
      allowancesJson,
      'Active',
    ];

    console.log(`📋 Database Insert Query:\n${query}`);
    console.log(`📊 Query Parameters:`, JSON.stringify({
      employeeId,
      name,
      email,
      phone,
      department,
      position,
      designation,
      joinDate,
      baseSalary,
      address,
      emergencyContact,
      requestPasswordChange,
      bankAccount,
      taxId,
      laptop,
      laptopSerial,
      charger,
      chargerSerial,
      mouse,
      mouseSerial,
      keyboard,
      keyboardSerial,
      monitor,
      monitorSerial,
      other,
      otherName,
      otherSerial,
      resourcesNote,
      allowances: allowancesJson,
      status: 'Active'
    }, null, 2));

    try {
      console.log(`🔄 Executing database query...`);
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('Query executed but no record returned from database');
      }
      
      console.log(`✅ Database Insert Successful`);
      console.log(`📊 Saved Employee Data:`, JSON.stringify(result.rows[0], null, 2));
      
      const employee = result.rows[0];

      // Create user account for the employee
      console.log(`\n👤 Creating user account for employee...`);
      try {
        const userAccount = await UserService.createUserFromEmployee({
          email: email,
          password: password,
          requestPasswordChange: requestPasswordChange,
          name: name
        });
        
        console.log(`✅ User Account Created Successfully`);
        console.log(`📊 User Account:`, JSON.stringify(userAccount, null, 2));
        
        return {
          ...employee,
          userAccount: userAccount,
          message: `Employee and user account created successfully. Password change ${requestPasswordChange ? 'is' : 'is not'} required on first login.`
        };
      } catch (userError) {
        console.warn(`⚠️ Employee created but user account creation failed: ${userError.message}`);
        return {
          ...employee,
          userAccountError: userError.message,
          message: `Employee created successfully, but user account creation failed. Please create account manually.`
        };
      }
    } catch (error) {
      console.error(`❌ Database Error:`, error.message);
      console.error(`📋 Error Details:`, error);
      throw new Error(`Failed to create employee: ${error.message}`);
    }
  }

  // Get all employees
  static async getAllEmployees(filters = {}) {
    let query = 'SELECT * FROM employees WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.department) {
      query += ` AND department = $${paramCount++}`;
      values.push(filters.department);
    }

    if (filters.status) {
      query += ` AND status = $${paramCount++}`;
      values.push(filters.status);
    }

    if (filters.search) {
      query += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount} OR employee_id ILIKE $${paramCount})`;
      values.push(`%${filters.search}%`);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to fetch employees: ${error.message}`);
    }
  }

  // Get employee by ID
  static async getEmployeeById(id) {
    const query = 'SELECT * FROM employees WHERE id = $1';

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to fetch employee: ${error.message}`);
    }
  }

  // Get employee by employee ID
  static async getEmployeeByEmployeeId(employeeId) {
    const query = 'SELECT * FROM employees WHERE employee_id = $1';

    try {
      const result = await pool.query(query, [employeeId]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to fetch employee: ${error.message}`);
    }
  }

  // Update employee
  static async updateEmployee(id, employeeData) {
    const timestamp = new Date().toISOString();
    console.log(`\n🗄️  [EmployeeService.updateEmployee] Service Method Called`);
    console.log(`⏰ Timestamp: ${timestamp}`);
    console.log(`📝 Employee ID: ${id}`);
    console.log(`📥 Update Data:`, JSON.stringify(employeeData, null, 2));
    
    // Handle allowances separately if provided
    if (employeeData.allowances && Array.isArray(employeeData.allowances)) {
      const allowancesJson = JSON.stringify(employeeData.allowances);
      console.log(`📊 Converting Allowances Array to JSON:`, allowancesJson);
      employeeData.allowances = allowancesJson;
    }

    const fields = Object.keys(employeeData)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');

    const query = `
      UPDATE employees 
      SET ${fields}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1
      RETURNING *;
    `;

    const values = [id, ...Object.values(employeeData)];

    console.log(`📋 Database Update Query:\n${query}`);
    console.log(`📊 Query Values:`, JSON.stringify(values, null, 2));

    try {
      console.log(`🔄 Executing database update query...`);
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        console.error(`❌ No employee found with ID: ${id}`);
        return null;
      }
      
      console.log(`✅ Database Update Successful`);
      console.log(`📊 Updated Employee Data:`, JSON.stringify(result.rows[0], null, 2));
      
      return result.rows[0];
    } catch (error) {
      console.error(`❌ Database Error:`, error.message);
      console.error(`📋 Error Details:`, error);
      throw new Error(`Failed to update employee: ${error.message}`);
    }
  }

  // Delete employee
  static async deleteEmployee(id) {
    const query = 'DELETE FROM employees WHERE id = $1 RETURNING *;';

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to delete employee: ${error.message}`);
    }
  }

  // Get employee count by department
  static async getEmployeeCountByDepartment() {
    const query = `
      SELECT department, COUNT(*) as count 
      FROM employees 
      GROUP BY department 
      ORDER BY count DESC;
    `;

    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to fetch employee count: ${error.message}`);
    }
  }
}

module.exports = EmployeeService;
