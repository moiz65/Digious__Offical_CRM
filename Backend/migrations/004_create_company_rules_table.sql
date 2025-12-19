-- Migration: Create company rules and attendance policies table
-- Version: 004
-- Description: Store company attendance rules, working hours, late policy, and shift information

CREATE TABLE IF NOT EXISTS company_rules (
  id SERIAL PRIMARY KEY,
  rule_name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  
  -- Office Hours Configuration (Night Shift)
  office_start_time TIME NOT NULL DEFAULT '21:00:00',
  office_end_time TIME NOT NULL DEFAULT '06:00:00',
  total_working_hours INT NOT NULL DEFAULT 9,
  
  -- Late Policy
  late_threshold_minutes INT NOT NULL DEFAULT 5,
  late_mark_time TIME NOT NULL DEFAULT '21:16:00',
  
  -- Week Configuration
  working_days_per_week INT NOT NULL DEFAULT 5,
  
  -- Days Off (JSON format to store flexible day configurations)
  -- Example: {"always_off": ["sunday"], "week1_off": ["saturday"], "week2_off": []}
  days_off_pattern JSON DEFAULT '{"always_off": ["sunday"], "week1_off": ["saturday"], "week2_off": []}',
  
  -- Shift Type Configuration
  shift_type VARCHAR(50) DEFAULT 'night',
  night_shift_enabled BOOLEAN DEFAULT true,
  night_shift_start_time TIME NOT NULL DEFAULT '21:00:00',
  night_shift_end_time TIME NOT NULL DEFAULT '06:00:00',
  night_shift_working_hours INT DEFAULT 9,
  
  -- Deduction Policy
  half_day_threshold_hours DECIMAL(5, 2) DEFAULT 4.5,
  full_day_absence_threshold_hours DECIMAL(5, 2) DEFAULT 0,
  
  -- Grace Period
  grace_period_minutes INT DEFAULT 0,
  
  -- Status and timestamps
  is_active BOOLEAN DEFAULT true,
  effective_from DATE DEFAULT CURRENT_DATE,
  effective_until DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CHECK (total_working_hours > 0),
  CHECK (late_threshold_minutes >= 0),
  CHECK (working_days_per_week BETWEEN 4 AND 7),
  CHECK (grace_period_minutes >= 0)
);

-- Create attendance policy history table for audit trail
CREATE TABLE IF NOT EXISTS attendance_rules_history (
  id SERIAL PRIMARY KEY,
  company_rules_id INT NOT NULL,
  office_start_time TIME,
  office_end_time TIME,
  total_working_hours INT,
  late_threshold_minutes INT,
  late_mark_time TIME,
  working_days_per_week INT,
  days_off_pattern JSON,
  night_shift_enabled BOOLEAN,
  night_shift_start_time TIME,
  night_shift_end_time TIME,
  changed_by VARCHAR(255),
  change_reason TEXT,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (company_rules_id) REFERENCES company_rules(id) ON DELETE CASCADE
);

-- Create department-specific rules table (optional, for override scenarios)
CREATE TABLE IF NOT EXISTS department_attendance_rules (
  id SERIAL PRIMARY KEY,
  department VARCHAR(100) NOT NULL UNIQUE,
  company_rules_id INT,
  
  -- Override default company rules if needed
  office_start_time TIME,
  office_end_time TIME,
  total_working_hours INT,
  late_threshold_minutes INT,
  late_mark_time TIME,
  working_days_per_week INT,
  days_off_pattern JSON,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (company_rules_id) REFERENCES company_rules(id) ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_company_rules_active ON company_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_company_rules_effective_from ON company_rules(effective_from);
CREATE INDEX IF NOT EXISTS idx_attendance_rules_history_company_rules_id ON attendance_rules_history(company_rules_id);
CREATE INDEX IF NOT EXISTS idx_department_attendance_rules_department ON department_attendance_rules(department);

-- Insert default company rules (Night Shift Only)
INSERT INTO company_rules (
  rule_name,
  description,
  office_start_time,
  office_end_time,
  total_working_hours,
  late_threshold_minutes,
  late_mark_time,
  working_days_per_week,
  days_off_pattern,
  shift_type,
  night_shift_enabled,
  night_shift_start_time,
  night_shift_end_time,
  night_shift_working_hours,
  half_day_threshold_hours,
  grace_period_minutes,
  is_active,
  effective_from
) VALUES (
  'Night Shift Standard Hours',
  'Night shift 9:00 PM to 6:00 AM with 9 working hours. All Sundays are off. First two weeks of month Saturday is off, remaining weeks Saturday is working day.',
  '21:00:00',
  '06:00:00',
  9,
  5,
  '21:05:00',
  5,
  '{"always_off": ["sunday"], "week1_off": ["saturday"], "week2_off": []}',
  'night',
  true,
  '21:00:00',
  '06:00:00',
  9,
  4.5,
  0,
  true,
  CURRENT_DATE
);
