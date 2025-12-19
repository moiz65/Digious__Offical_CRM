const express = require('express');
const router = express.Router();

// Get all departments
router.get('/', (req, res) => {
  try {
    const departments = [
      { id: 1, name: 'Sales', code: 'SALES' },
      { id: 2, name: 'Marketing', code: 'MKT' },
      { id: 3, name: 'Production', code: 'PROD' },
      { id: 4, name: 'HR', code: 'HR' },
      { id: 5, name: 'Operations', code: 'OPS' }
    ];

    res.status(200).json({
      success: true,
      message: 'Departments retrieved successfully',
      count: departments.length,
      data: departments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve departments',
      error: error.message
    });
  }
});

// Get department by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const departments = [
      { id: 1, name: 'Sales', code: 'SALES' },
      { id: 2, name: 'Marketing', code: 'MKT' },
      { id: 3, name: 'Production', code: 'PROD' },
      { id: 4, name: 'HR', code: 'HR' },
      { id: 5, name: 'Operations', code: 'OPS' }
    ];

    const department = departments.find(d => d.id === parseInt(id));

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Department retrieved successfully',
      data: department
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve department',
      error: error.message
    });
  }
});

module.exports = router;
