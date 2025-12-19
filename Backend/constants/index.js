// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
};

// User Roles
const USER_ROLES = {
  ADMIN: 'admin',
  HR: 'hr',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
  SUPER_ADMIN: 'super_admin'
};

// Employee Status
const EMPLOYEE_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  ON_LEAVE: 'On Leave',
  TERMINATED: 'Terminated',
  SUSPENDED: 'Suspended'
};

// Attendance Status
const ATTENDANCE_STATUS = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  LEAVE: 'Leave',
  HALF_DAY: 'Half Day',
  WORK_FROM_HOME: 'Work from Home'
};

// Departments
const DEPARTMENTS = [
  { id: 1, name: 'IT', description: 'Information Technology' },
  { id: 2, name: 'HR', description: 'Human Resources' },
  { id: 3, name: 'Sales', description: 'Sales and Marketing' },
  { id: 4, name: 'Finance', description: 'Finance and Accounting' },
  { id: 5, name: 'Operations', description: 'Operations' },
  { id: 6, name: 'Support', description: 'Customer Support' }
];

// Positions
const POSITIONS = [
  'Manager',
  'Senior Developer',
  'Developer',
  'Junior Developer',
  'Analyst',
  'Senior Analyst',
  'Coordinator',
  'Executive',
  'Specialist',
  'Officer'
];

// Error Messages
const ERROR_MESSAGES = {
  EMPLOYEE_NOT_FOUND: 'Employee not found',
  EMPLOYEE_ALREADY_EXISTS: 'Employee with this email already exists',
  INVALID_EMAIL: 'Invalid email format',
  INVALID_PASSWORD: 'Password must be at least 6 characters',
  AUTHENTICATION_FAILED: 'Authentication failed',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  INVALID_INPUT: 'Invalid input provided',
  DATABASE_ERROR: 'Database error occurred',
  SERVER_ERROR: 'Internal server error'
};

// Success Messages
const SUCCESS_MESSAGES = {
  EMPLOYEE_CREATED: 'Employee created successfully',
  EMPLOYEE_UPDATED: 'Employee updated successfully',
  EMPLOYEE_DELETED: 'Employee deleted successfully',
  EMPLOYEES_RETRIEVED: 'Employees retrieved successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  SIGNUP_SUCCESS: 'Signup successful'
};

// Validation Rules
const VALIDATION_RULES = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 128,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  PHONE_REGEX: /^\+?[0-9\s\-()]+$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  CNIC_REGEX: /^\d{5}-\d{7}-\d{1}$/
};

// Pagination Defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

// JWT Configuration
const JWT_CONFIG = {
  EXPIRY: process.env.JWT_EXPIRY || '24h',
  REFRESH_EXPIRY: '7d'
};

module.exports = {
  HTTP_STATUS,
  USER_ROLES,
  EMPLOYEE_STATUS,
  ATTENDANCE_STATUS,
  DEPARTMENTS,
  POSITIONS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION_RULES,
  PAGINATION,
  JWT_CONFIG
};
