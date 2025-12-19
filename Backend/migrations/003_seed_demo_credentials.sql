-- Migration: Seed demo credentials
-- Version: 003
-- Description: Insert demo user accounts for testing

-- Delete demo accounts if they exist (for re-running migration)
DELETE FROM users WHERE email IN ('admin@digious.com', 'hr@digious.com', 'employee@digious.com');
DELETE FROM employees WHERE email IN ('admin@digious.com', 'hr@digious.com', 'employee@digious.com');

-- Insert demo admin employee
INSERT INTO employees (employee_id, name, email, phone, department, position, salary)
VALUES (
  'DEM-001',
  'Admin User',
  'admin@digious.com',
  '+1-800-0001',
  'IT',
  'System Administrator',
  100000
);

-- Insert demo HR employee
INSERT INTO employees (employee_id, name, email, phone, department, position, salary)
VALUES (
  'DEM-002',
  'HR User',
  'hr@digious.com',
  '+1-800-0002',
  'Human Resources',
  'HR Manager',
  75000
);

-- Insert demo employee
INSERT INTO employees (employee_id, name, email, phone, department, position, salary)
VALUES (
  'DEM-003',
  'Employee User',
  'employee@digious.com',
  '+1-800-0003',
  'Operations',
  'Operations Officer',
  45000
);

-- Insert demo admin account
INSERT INTO users (employee_id, email, password, role, is_active, request_password_change)
SELECT id, 'admin@digious.com', '$2a$10$ooBbRrWP.kDHitW.kR9dYu6ZVZ.vXbxDKobm/CSgNlfgIZLt8itja', 'admin', true, false
FROM employees WHERE email = 'admin@digious.com';

-- Insert demo HR account
INSERT INTO users (employee_id, email, password, role, is_active, request_password_change)
SELECT id, 'hr@digious.com', '$2a$10$5NOTAgWwCYq.n1sLFLpe3O3cJnQrh5NNN0/QxnPKOuQxrWr5RdRSS', 'hr', true, false
FROM employees WHERE email = 'hr@digious.com';

-- Insert demo employee account
INSERT INTO users (employee_id, email, password, role, is_active, request_password_change)
SELECT id, 'employee@digious.com', '$2a$10$tlMCQRXXqFb7li843mCAuOvyFgIeTf4sMmYskVW5Uyz4mUE68JGmm', 'employee', true, false
FROM employees WHERE email = 'employee@digious.com';
