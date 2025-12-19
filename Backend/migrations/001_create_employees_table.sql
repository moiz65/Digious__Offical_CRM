-- Migration: Create employees table
-- Version: 001
-- Description: Create employees table with all onboarding fields

CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  confirm_password VARCHAR(255),
  phone VARCHAR(20),
  department VARCHAR(100),
  position VARCHAR(100),
  designation VARCHAR(100),
  join_date DATE,
  base_salary DECIMAL(12, 2),
  address TEXT,
  emergency_contact VARCHAR(20),
  request_password_change BOOLEAN DEFAULT false,
  bank_account VARCHAR(50),
  tax_id VARCHAR(50),
  
  -- Resource allocation
  laptop BOOLEAN DEFAULT false,
  laptop_serial VARCHAR(100),
  charger BOOLEAN DEFAULT false,
  charger_serial VARCHAR(100),
  mouse BOOLEAN DEFAULT false,
  mouse_serial VARCHAR(100),
  keyboard BOOLEAN DEFAULT false,
  keyboard_serial VARCHAR(100),
  monitor BOOLEAN DEFAULT false,
  monitor_serial VARCHAR(100),
  other BOOLEAN DEFAULT false,
  other_name VARCHAR(100),
  other_serial VARCHAR(100),
  resources_note TEXT,
  
  -- Allowances (stored as JSON)
  allowances JSON DEFAULT '[]',
  
  -- Status and timestamps
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_employee_id ON employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_status ON employees(status);

-- Create allowances tracking table (optional, for normalization)
CREATE TABLE IF NOT EXISTS allowances (
  id SERIAL PRIMARY KEY,
  employee_id INT NOT NULL,
  allowance_name VARCHAR(100) NOT NULL,
  allowance_amount DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Create index for allowances
CREATE INDEX IF NOT EXISTS idx_allowances_employee_id ON allowances(employee_id);

-- Create audit log table
CREATE TABLE IF NOT EXISTS employee_audit_log (
  id SERIAL PRIMARY KEY,
  employee_id INT,
  action VARCHAR(50) NOT NULL,
  changed_fields JSON,
  changed_by VARCHAR(255),
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- Create indexes for audit log
CREATE INDEX IF NOT EXISTS idx_audit_employee_id ON employee_audit_log(employee_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON employee_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_changed_at ON employee_audit_log(changed_at);
