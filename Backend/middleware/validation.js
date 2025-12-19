const Joi = require('joi');

// Employee Validation Schemas
const employeeSchemas = {
  create: Joi.object({
    employeeId: Joi.string().required().messages({
      'string.empty': 'Employee ID is required'
    }),
    firstName: Joi.string().required().messages({
      'string.empty': 'First name is required'
    }),
    lastName: Joi.string().required().messages({
      'string.empty': 'Last name is required'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Invalid email format',
      'string.empty': 'Email is required'
    }),
    phone: Joi.string().required().messages({
      'string.empty': 'Phone number is required'
    }),
    dateOfBirth: Joi.date().messages({
      'date.base': 'Invalid date format'
    }),
    joiningDate: Joi.date().required().messages({
      'date.base': 'Invalid joining date',
      'any.required': 'Joining date is required'
    }),
    department: Joi.string().required().messages({
      'string.empty': 'Department is required'
    }),
    position: Joi.string().required().messages({
      'string.empty': 'Position is required'
    }),
    baseSalary: Joi.number().positive().required().messages({
      'number.positive': 'Base salary must be positive',
      'any.required': 'Base salary is required'
    }),
    allowances: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        amount: Joi.number().positive().required()
      })
    ),
    resourcesAllocated: Joi.array().items(Joi.string()),
    status: Joi.string().valid('Active', 'Inactive', 'On Leave').default('Active'),
    gender: Joi.string().valid('Male', 'Female', 'Other'),
    cnic: Joi.string(),
    address: Joi.string(),
    city: Joi.string(),
    country: Joi.string(),
    bankAccountNumber: Joi.string(),
    bankName: Joi.string()
  }),

  update: Joi.object({
    firstName: Joi.string(),
    lastName: Joi.string(),
    email: Joi.string().email(),
    phone: Joi.string(),
    department: Joi.string(),
    position: Joi.string(),
    baseSalary: Joi.number().positive(),
    allowances: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        amount: Joi.number().positive().required()
      })
    ),
    resourcesAllocated: Joi.array().items(Joi.string()),
    status: Joi.string().valid('Active', 'Inactive', 'On Leave'),
    city: Joi.string(),
    country: Joi.string()
  }).min(1) // At least one field required for update
};

// Authentication Validation Schemas
const authSchemas = {
  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Invalid email format',
      'string.empty': 'Email is required'
    }),
    password: Joi.string().required().min(6).messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters'
    })
  }),

  signup: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Invalid email format',
      'string.empty': 'Email is required'
    }),
    password: Joi.string().required().min(6).messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters'
    }),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    role: Joi.string().valid('admin', 'hr', 'employee', 'manager').default('employee')
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required().messages({
      'string.empty': 'Refresh token is required'
    })
  })
};

// Attendance Validation Schemas
const attendanceSchemas = {
  create: Joi.object({
    employeeId: Joi.string().required().messages({
      'string.empty': 'Employee ID is required'
    }),
    date: Joi.date().required().messages({
      'date.base': 'Invalid date format',
      'any.required': 'Date is required'
    }),
    checkInTime: Joi.string().required().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).messages({
      'string.empty': 'Check-in time is required',
      'string.pattern.base': 'Invalid time format. Use HH:mm'
    }),
    checkOutTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).messages({
      'string.pattern.base': 'Invalid time format. Use HH:mm'
    }),
    status: Joi.string().valid('Present', 'Absent', 'Leave', 'Half Day').default('Present'),
    notes: Joi.string().allow('')
  }),

  update: Joi.object({
    checkInTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
    checkOutTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
    status: Joi.string().valid('Present', 'Absent', 'Leave', 'Half Day'),
    notes: Joi.string().allow('')
  }).min(1)
};

module.exports = {
  employeeSchemas,
  authSchemas,
  attendanceSchemas
};
