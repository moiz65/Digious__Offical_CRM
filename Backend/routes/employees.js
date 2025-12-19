const express = require('express');
const router = express.Router();
const EmployeeService = require('../services/EmployeeService');

// Create new employee
router.post('/', async (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`\n🔧 [POST /api/v1/employees] Employee Creation Route Called`);
  console.log(`⏰ Timestamp: ${timestamp}`);
  
  try {
    const employeeData = req.body;
    console.log(`📥 Received Employee Data:`, JSON.stringify(employeeData, null, 2));
    
    // Validate required fields
    if (!employeeData.employeeId || !employeeData.name || !employeeData.email) {
      console.error(`❌ Validation Failed - Missing Required Fields`);
      console.error(`   employeeId: ${employeeData.employeeId}`);
      console.error(`   name: ${employeeData.name}`);
      console.error(`   email: ${employeeData.email}`);
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: employeeId, name, email'
      });
    }

    console.log(`✅ Validation Passed`);
    console.log(`🔄 Calling EmployeeService.createEmployee()...`);
    
    const employee = await EmployeeService.createEmployee(employeeData);
    
    console.log(`✅ Employee Created Successfully in Database`);
    console.log(`📊 Created Employee Record:`, JSON.stringify(employee, null, 2));
    
    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee
    });
  } catch (error) {
    console.error(`❌ Error Creating Employee:`, error.message);
    console.error(`📋 Stack Trace:`, error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to create employee',
      error: error.message
    });
  }
});

// Get all employees with filters
router.get('/', async (req, res) => {
  try {
    const { department, status, search } = req.query;
    const filters = {};
    
    if (department) filters.department = department;
    if (status) filters.status = status;
    if (search) filters.search = search;

    const employees = await EmployeeService.getAllEmployees(filters);
    
    res.status(200).json({
      success: true,
      message: 'Employees retrieved successfully',
      count: employees.length,
      data: employees
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve employees',
      error: error.message
    });
  }
});

// Get employee by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid employee ID'
      });
    }

    const employee = await EmployeeService.getEmployeeById(id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Employee retrieved successfully',
      data: employee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve employee',
      error: error.message
    });
  }
});

// Get employee by employee ID
router.get('/by-employee-id/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required'
      });
    }

    const employee = await EmployeeService.getEmployeeByEmployeeId(employeeId);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Employee retrieved successfully',
      data: employee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve employee',
      error: error.message
    });
  }
});

// Update employee
router.put('/:id', async (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`\n🔧 [PUT /api/v1/employees/:id] Employee Update Route Called`);
  console.log(`⏰ Timestamp: ${timestamp}`);
  
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    console.log(`📝 Employee ID to Update: ${id}`);
    console.log(`📥 Received Update Data:`, JSON.stringify(updateData, null, 2));
    
    if (!id || isNaN(id)) {
      console.error(`❌ Validation Failed - Invalid ID: ${id}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid employee ID'
      });
    }

    if (Object.keys(updateData).length === 0) {
      console.error(`❌ Validation Failed - No update data provided`);
      return res.status(400).json({
        success: false,
        message: 'No data provided for update'
      });
    }

    console.log(`✅ Validation Passed`);
    console.log(`🔄 Calling EmployeeService.updateEmployee()...`);
    
    const employee = await EmployeeService.updateEmployee(id, updateData);
    
    if (!employee) {
      console.error(`❌ Employee not found with ID: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    console.log(`✅ Employee Updated Successfully in Database`);
    console.log(`📊 Updated Employee Record:`, JSON.stringify(employee, null, 2));

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: employee
    });
  } catch (error) {
    console.error(`❌ Error Updating Employee:`, error.message);
    console.error(`📋 Stack Trace:`, error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to update employee',
      error: error.message
    });
  }
});

// Delete employee
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid employee ID'
      });
    }

    const employee = await EmployeeService.deleteEmployee(id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully',
      data: employee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete employee',
      error: error.message
    });
  }
});

// Get employee count by department
router.get('/analytics/count-by-department', async (req, res) => {
  try {
    const stats = await EmployeeService.getEmployeeCountByDepartment();
    
    res.status(200).json({
      success: true,
      message: 'Employee statistics retrieved',
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve statistics',
      error: error.message
    });
  }
});

module.exports = router;
