-- Migration: Create user system information and session management table
-- Version: 005
-- Description: Track user system details, login information, IP/MAC addresses, and enforce single session policy

CREATE TABLE IF NOT EXISTS user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  
  -- Session Identification
  session_token VARCHAR(500) UNIQUE,
  session_id UUID DEFAULT gen_random_uuid(),
  
  -- System Information
  ip_address VARCHAR(45) NOT NULL,
  mac_address VARCHAR(17),
  device_name VARCHAR(255),
  operating_system VARCHAR(100),
  browser_user_agent TEXT,
  
  -- Login Information
  login_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  logout_time TIMESTAMP,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Session Status
  is_active BOOLEAN DEFAULT true,
  login_status VARCHAR(50) DEFAULT 'active',
  session_duration_minutes INT,
  
  -- Security
  is_forced_logout BOOLEAN DEFAULT false,
  logout_reason VARCHAR(255),
  
  -- Multiple Session Policy
  is_primary_session BOOLEAN DEFAULT true,
  
  -- Location and Device Tracking
  city VARCHAR(100),
  country VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CHECK (login_status IN ('active', 'idle', 'locked', 'logged_out', 'expired'))
);

-- Create table to track all login attempts (for security audit)
CREATE TABLE IF NOT EXISTS login_attempts (
  id SERIAL PRIMARY KEY,
  user_id INT,
  email VARCHAR(255) NOT NULL,
  
  -- System Information
  ip_address VARCHAR(45) NOT NULL,
  mac_address VARCHAR(17),
  device_name VARCHAR(255),
  operating_system VARCHAR(100),
  browser_user_agent TEXT,
  
  -- Attempt Status
  attempt_status VARCHAR(50) DEFAULT 'pending',
  success BOOLEAN DEFAULT false,
  failure_reason VARCHAR(255),
  
  -- Location
  city VARCHAR(100),
  country VARCHAR(100),
  
  attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CHECK (attempt_status IN ('pending', 'success', 'failed', 'blocked'))
);

-- Create table to track active sessions per user (for enforcing single login)
CREATE TABLE IF NOT EXISTS active_user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  current_session_id INT NOT NULL,
  
  -- Previous session info (for comparison)
  previous_session_id INT,
  session_conflict_flag BOOLEAN DEFAULT false,
  
  -- Force logout details
  force_logout_on_new_login BOOLEAN DEFAULT true,
  
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (current_session_id) REFERENCES user_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (previous_session_id) REFERENCES user_sessions(id) ON DELETE SET NULL
);

-- Create table for device fingerprinting and trusted devices
CREATE TABLE IF NOT EXISTS trusted_devices (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  
  -- Device Information
  device_fingerprint VARCHAR(500) UNIQUE NOT NULL,
  device_name VARCHAR(255),
  device_type VARCHAR(50),
  
  -- System Details
  operating_system VARCHAR(100),
  browser_name VARCHAR(100),
  browser_version VARCHAR(50),
  
  -- Trust Status
  is_trusted BOOLEAN DEFAULT false,
  trust_level VARCHAR(50) DEFAULT 'unverified',
  
  -- Timestamps
  first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CHECK (trust_level IN ('unverified', 'suspicious', 'verified', 'trusted', 'blocked'))
);

-- Create table for IP whitelist (trusted IPs per user)
CREATE TABLE IF NOT EXISTS ip_whitelist (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  
  -- IP Information
  ip_address VARCHAR(45) NOT NULL,
  ip_label VARCHAR(100),
  
  -- Trust Status
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  
  -- Timestamps
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP,
  last_used TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create table for suspicious activity alerts
CREATE TABLE IF NOT EXISTS suspicious_activities (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  session_id INT,
  
  -- Alert Information
  alert_type VARCHAR(100) NOT NULL,
  alert_description TEXT,
  
  -- Trigger Details
  ip_address VARCHAR(45),
  mac_address VARCHAR(17),
  previous_ip_address VARCHAR(45),
  previous_country VARCHAR(100),
  current_country VARCHAR(100),
  
  -- Risk Assessment
  risk_level VARCHAR(50) DEFAULT 'medium',
  is_resolved BOOLEAN DEFAULT false,
  
  -- Admin Action
  admin_notes TEXT,
  admin_action VARCHAR(100),
  reviewed_by INT,
  reviewed_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES user_sessions(id) ON DELETE SET NULL,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
  CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  CHECK (alert_type IN ('new_device', 'new_location', 'unusual_time', 'impossible_travel', 'multiple_failed_attempts', 'other'))
);

-- Create table for session notes and admin comments
CREATE TABLE IF NOT EXISTS session_notes (
  id SERIAL PRIMARY KEY,
  session_id INT NOT NULL,
  user_id INT NOT NULL,
  
  -- Note Information
  note_text TEXT NOT NULL,
  note_category VARCHAR(50),
  
  -- Who added the note
  added_by INT NOT NULL,
  
  -- Status
  is_important BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (session_id) REFERENCES user_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_login_time ON user_sessions(login_time);
CREATE INDEX IF NOT EXISTS idx_user_sessions_ip_address ON user_sessions(ip_address);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_token ON user_sessions(session_token);

CREATE INDEX IF NOT EXISTS idx_login_attempts_user_id ON login_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_address ON login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_attempt_time ON login_attempts(attempt_time);

CREATE INDEX IF NOT EXISTS idx_active_user_sessions_user_id ON active_user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_active_user_sessions_current_session_id ON active_user_sessions(current_session_id);

CREATE INDEX IF NOT EXISTS idx_trusted_devices_user_id ON trusted_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_trusted_devices_device_fingerprint ON trusted_devices(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_trusted_devices_is_trusted ON trusted_devices(is_trusted);

CREATE INDEX IF NOT EXISTS idx_ip_whitelist_user_id ON ip_whitelist(user_id);
CREATE INDEX IF NOT EXISTS idx_ip_whitelist_ip_address ON ip_whitelist(ip_address);
CREATE INDEX IF NOT EXISTS idx_ip_whitelist_is_active ON ip_whitelist(is_active);

CREATE INDEX IF NOT EXISTS idx_suspicious_activities_user_id ON suspicious_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_suspicious_activities_session_id ON suspicious_activities(session_id);
CREATE INDEX IF NOT EXISTS idx_suspicious_activities_alert_type ON suspicious_activities(alert_type);
CREATE INDEX IF NOT EXISTS idx_suspicious_activities_risk_level ON suspicious_activities(risk_level);
CREATE INDEX IF NOT EXISTS idx_suspicious_activities_is_resolved ON suspicious_activities(is_resolved);
CREATE INDEX IF NOT EXISTS idx_suspicious_activities_created_at ON suspicious_activities(created_at);

CREATE INDEX IF NOT EXISTS idx_session_notes_session_id ON session_notes(session_id);
CREATE INDEX IF NOT EXISTS idx_session_notes_user_id ON session_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_session_notes_added_by ON session_notes(added_by);
CREATE INDEX IF NOT EXISTS idx_session_notes_is_important ON session_notes(is_important);

-- Create trigger function to automatically update session duration when logging out
CREATE OR REPLACE FUNCTION update_session_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.logout_time IS NOT NULL THEN
    NEW.session_duration_minutes := EXTRACT(EPOCH FROM (NEW.logout_time - NEW.login_time)) / 60;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
CREATE TRIGGER trigger_update_session_duration
BEFORE UPDATE ON user_sessions
FOR EACH ROW
EXECUTE FUNCTION update_session_duration();

-- Create trigger function to prevent multiple active sessions for same user
CREATE OR REPLACE FUNCTION enforce_single_session()
RETURNS TRIGGER AS $$
DECLARE
  existing_session_id INT;
BEGIN
  -- Find if user has an active session
  SELECT id INTO existing_session_id
  FROM user_sessions
  WHERE user_id = NEW.user_id AND is_active = true AND id != NEW.id
  LIMIT 1;
  
  IF existing_session_id IS NOT NULL THEN
    -- Mark old session as logged out
    UPDATE user_sessions
    SET is_active = false,
        logout_time = CURRENT_TIMESTAMP,
        is_forced_logout = true,
        logout_reason = 'New login detected - previous session terminated',
        session_duration_minutes = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - login_time)) / 60
    WHERE id = existing_session_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce single session
CREATE TRIGGER trigger_enforce_single_session
AFTER INSERT ON user_sessions
FOR EACH ROW
WHEN (NEW.is_active = true)
EXECUTE FUNCTION enforce_single_session();

-- Insert sample data for demonstration
INSERT INTO user_sessions (
  user_id,
  session_token,
  ip_address,
  mac_address,
  device_name,
  operating_system,
  browser_user_agent,
  login_status,
  is_primary_session,
  city,
  country
) 
SELECT 
  id,
  MD5(RANDOM()::TEXT || CURRENT_TIMESTAMP::TEXT),
  '192.168.' || (RANDOM()*255)::INT || '.' || (RANDOM()*255)::INT,
  UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 2)) || ':' ||
  UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 3, 2)) || ':' ||
  UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 5, 2)) || ':' ||
  UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 7, 2)) || ':' ||
  UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 9, 2)) || ':' ||
  UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 11, 2)),
  'Desktop-' || id,
  'Windows 10',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  'active',
  true,
  'Karachi',
  'Pakistan'
FROM users
WHERE is_active = true;
