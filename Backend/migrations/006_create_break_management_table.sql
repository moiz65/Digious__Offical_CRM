-- Migration: Create break management table
-- Version: 006
-- Description: Store break policies and break types for employees

CREATE TABLE IF NOT EXISTS break_types (
  id SERIAL PRIMARY KEY,
  break_name VARCHAR(100) NOT NULL UNIQUE,
  break_description TEXT,
  
  -- Break Duration
  duration_minutes INT NOT NULL,
  
  -- Break Configuration
  is_paid BOOLEAN DEFAULT false,
  is_mandatory BOOLEAN DEFAULT false,
  requires_approval BOOLEAN DEFAULT false,
  
  -- Break Timing
  earliest_start_time TIME,
  latest_end_time TIME,
  
  -- Frequency
  allowed_per_day INT DEFAULT 1,
  allowed_per_week INT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create table to track break policies per company/department
CREATE TABLE IF NOT EXISTS break_policies (
  id SERIAL PRIMARY KEY,
  company_rules_id INT,
  
  -- Break Policy Configuration
  policy_name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  
  -- Total Break Time per Day
  total_break_time_minutes INT NOT NULL DEFAULT 82,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  effective_from DATE DEFAULT CURRENT_DATE,
  effective_until DATE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (company_rules_id) REFERENCES company_rules(id) ON DELETE SET NULL
);

-- Create junction table for break types in policies
CREATE TABLE IF NOT EXISTS policy_break_types (
  id SERIAL PRIMARY KEY,
  break_policy_id INT NOT NULL,
  break_type_id INT NOT NULL,
  
  -- Sequence/Order
  break_order INT,
  
  -- Specific Configuration for this policy
  duration_minutes INT,
  allowed_per_day INT,
  is_mandatory_in_policy BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (break_policy_id) REFERENCES break_policies(id) ON DELETE CASCADE,
  FOREIGN KEY (break_type_id) REFERENCES break_types(id) ON DELETE CASCADE,
  UNIQUE(break_policy_id, break_type_id)
);

-- Create table to track employee break usage
CREATE TABLE IF NOT EXISTS employee_breaks (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  session_id INT,
  break_type_id INT NOT NULL,
  
  -- Break Timing
  break_start_time TIMESTAMP NOT NULL,
  break_end_time TIMESTAMP,
  actual_break_duration_minutes INT,
  
  -- Break Status
  break_status VARCHAR(50) DEFAULT 'in_progress',
  
  -- Approval
  approved_by INT,
  approval_time TIMESTAMP,
  rejection_reason TEXT,
  
  -- Notes
  break_notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES user_sessions(id) ON DELETE SET NULL,
  FOREIGN KEY (break_type_id) REFERENCES break_types(id) ON DELETE RESTRICT,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
  CHECK (break_status IN ('pending', 'in_progress', 'completed', 'approved', 'rejected', 'exceeded'))
);

-- Create table to track daily break summary
CREATE TABLE IF NOT EXISTS daily_break_summary (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  break_date DATE NOT NULL,
  
  -- Daily Break Statistics
  total_break_time_minutes INT DEFAULT 0,
  total_breaks_taken INT DEFAULT 0,
  
  -- Individual Break Counts
  smoke_breaks INT DEFAULT 0,
  dinner_breaks INT DEFAULT 0,
  washroom_breaks INT DEFAULT 0,
  prayer_breaks INT DEFAULT 0,
  
  -- Compliance
  is_compliant BOOLEAN DEFAULT true,
  exceeds_limit BOOLEAN DEFAULT false,
  
  -- Notes
  admin_notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, break_date)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_break_types_is_active ON break_types(is_active);
CREATE INDEX IF NOT EXISTS idx_break_types_break_name ON break_types(break_name);

CREATE INDEX IF NOT EXISTS idx_break_policies_is_active ON break_policies(is_active);
CREATE INDEX IF NOT EXISTS idx_break_policies_company_rules_id ON break_policies(company_rules_id);

CREATE INDEX IF NOT EXISTS idx_policy_break_types_break_policy_id ON policy_break_types(break_policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_break_types_break_type_id ON policy_break_types(break_type_id);

CREATE INDEX IF NOT EXISTS idx_employee_breaks_user_id ON employee_breaks(user_id);
CREATE INDEX IF NOT EXISTS idx_employee_breaks_session_id ON employee_breaks(session_id);
CREATE INDEX IF NOT EXISTS idx_employee_breaks_break_type_id ON employee_breaks(break_type_id);
CREATE INDEX IF NOT EXISTS idx_employee_breaks_break_status ON employee_breaks(break_status);
CREATE INDEX IF NOT EXISTS idx_employee_breaks_break_start_time ON employee_breaks(break_start_time);

CREATE INDEX IF NOT EXISTS idx_daily_break_summary_user_id ON daily_break_summary(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_break_summary_break_date ON daily_break_summary(break_date);
CREATE INDEX IF NOT EXISTS idx_daily_break_summary_is_compliant ON daily_break_summary(is_compliant);

-- Insert break types
INSERT INTO break_types (break_name, break_description, duration_minutes, is_paid, is_mandatory, allowed_per_day) 
VALUES 
  ('Smoke Break', 'Short smoke break', 2, false, false, 1),
  ('Dinner Break', 'Lunch/Dinner break', 60, true, true, 1),
  ('Washroom Break', 'Restroom break', 10, false, false, 3),
  ('Prayer Break', 'Prayer/Religious break', 10, false, false, 2)
ON CONFLICT (break_name) DO NOTHING;

-- Insert default break policy
INSERT INTO break_policies (policy_name, description, total_break_time_minutes, is_active, effective_from)
VALUES 
  ('Standard Break Policy', 'Standard company break policy with smoke, dinner, washroom, and prayer breaks', 82, true, CURRENT_DATE)
ON CONFLICT (policy_name) DO NOTHING;

-- Link break types to policy
INSERT INTO policy_break_types (break_policy_id, break_type_id, break_order, duration_minutes, allowed_per_day, is_mandatory_in_policy)
SELECT bp.id, bt.id, 
  CASE bt.break_name
    WHEN 'Smoke Break' THEN 1
    WHEN 'Dinner Break' THEN 2
    WHEN 'Washroom Break' THEN 3
    WHEN 'Prayer Break' THEN 4
  END,
  bt.duration_minutes,
  CASE bt.break_name
    WHEN 'Smoke Break' THEN 1
    WHEN 'Dinner Break' THEN 1
    WHEN 'Washroom Break' THEN 3
    WHEN 'Prayer Break' THEN 2
  END,
  CASE bt.break_name
    WHEN 'Dinner Break' THEN true
    ELSE false
  END
FROM break_policies bp
CROSS JOIN break_types bt
WHERE bp.policy_name = 'Standard Break Policy'
  AND bp.is_active = true
  ON CONFLICT (break_policy_id, break_type_id) DO NOTHING;
