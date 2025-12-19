#!/bin/bash

# Comprehensive Debug Test Script
# Tests all operations and logs everything to a file

LOG_FILE="/tmp/debug_test_$(date +%s).log"
DB_PASS="digious123"
DB_USER="digious_user"
DB_NAME="digious_crm"
DB_HOST="localhost"
API_URL="http://localhost:5000/api/v1"

echo "====== STARTING COMPREHENSIVE DEBUG TEST ======"
echo "Log file: $LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Function to log and display
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to run curl and log response
test_endpoint() {
  local name=$1
  local method=$2
  local endpoint=$3
  local data=$4
  local headers=$5
  
  log "=========================================="
  log "TEST: $name"
  log "Method: $method | Endpoint: $endpoint"
  
  if [ -z "$headers" ]; then
    headers="-H 'Content-Type: application/json'"
  fi
  
  if [ "$method" = "POST" ]; then
    log "Request Body: $data"
    response=$(curl -s -X POST "$API_URL$endpoint" \
      $headers \
      -d "$data" 2>&1)
  else
    response=$(curl -s -X GET "$API_URL$endpoint" $headers 2>&1)
  fi
  
  log "Response: $response"
  echo "" | tee -a "$LOG_FILE"
}

# Function to query database and log
query_db() {
  local name=$1
  local query=$2
  
  log "=========================================="
  log "DATABASE QUERY: $name"
  log "Query: $query"
  
  result=$(PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -t -c "$query" 2>&1)
  
  log "Result:"
  echo "$result" | tee -a "$LOG_FILE"
  echo "" | tee -a "$LOG_FILE"
}

# ==== START TESTS ====

log "STEP 1: TEST LOGIN"
test_endpoint "Login Demo User" "POST" "/auth/login" \
  '{"email":"employee@digious.com","password":"emp123"}' \
  "-H 'Content-Type: application/json' -H 'x-device-name: Laptop-Chrome'"

# Extract session ID from last response
SESSION_ID=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
SESSION_TOKEN=$(echo "$response" | grep -o '"sessionToken":"[^"]*' | head -1 | sed 's/"sessionToken":"//')

log "Extracted Session ID: $SESSION_ID"
log "Extracted Session Token: ${SESSION_TOKEN:0:20}..."

# Query user_sessions table
query_db "Check user_sessions table after login" \
  "SELECT id, user_id, ip_address, device_name, login_time, is_active FROM user_sessions WHERE id = $SESSION_ID;"

# Check all sessions
query_db "Count all user_sessions" \
  "SELECT COUNT(*) as total_sessions FROM user_sessions;"

echo "" | tee -a "$LOG_FILE"
log "STEP 2: TEST BREAK TYPES"
test_endpoint "Get Break Types" "GET" "/breaks/types"

# Query break_types table
query_db "Check break_types table" \
  "SELECT id, break_name, duration_minutes FROM break_types ORDER BY id;"

echo "" | tee -a "$LOG_FILE"
log "STEP 3: TEST START BREAK"
test_endpoint "Start Smoke Break" "POST" "/breaks/start" \
  '{"user_id":3,"break_type_id":1,"notes":"Debug test"}' \
  "-H 'Content-Type: application/json'"

# Extract break ID
BREAK_ID=$(echo "$response" | grep -o '"id":[0-9]*' | grep -o '[0-9]*' | head -1)
log "Extracted Break ID: $BREAK_ID"

# Query employee_breaks table
query_db "Check employee_breaks table after start break" \
  "SELECT id, user_id, break_type_id, break_start_time, break_status FROM employee_breaks WHERE id = $BREAK_ID;"

# Check all breaks for today
query_db "Check today's breaks for user 3" \
  "SELECT id, user_id, break_type_id, break_start_time, break_end_time, break_status FROM employee_breaks WHERE user_id = 3 AND DATE(break_start_time) = CURRENT_DATE;"

echo "" | tee -a "$LOG_FILE"
log "STEP 4: TEST GET ACTIVE BREAK"
test_endpoint "Get Active Break" "GET" "/breaks/active/3"

query_db "Check employee_breaks in_progress status" \
  "SELECT id, user_id, break_type_id, break_status, break_start_time FROM employee_breaks WHERE user_id = 3 AND break_status = 'in_progress';"

echo "" | tee -a "$LOG_FILE"
log "STEP 5: WAIT 5 SECONDS"
sleep 5
log "Waited 5 seconds..."

echo "" | tee -a "$LOG_FILE"
log "STEP 6: TEST END BREAK"
test_endpoint "End Break" "POST" "/breaks/end" \
  '{"user_id":3}' \
  "-H 'Content-Type: application/json'"

# Query employee_breaks to see end time
query_db "Check employee_breaks after end break" \
  "SELECT id, user_id, break_type_id, break_start_time, break_end_time, break_status, actual_break_duration_minutes FROM employee_breaks WHERE id = $BREAK_ID;"

echo "" | tee -a "$LOG_FILE"
log "STEP 7: TEST DAILY BREAK SUMMARY"
test_endpoint "Get Daily Break Summary" "GET" "/breaks/summary/3"

# Query daily_break_summary table
query_db "Check daily_break_summary table" \
  "SELECT user_id, summary_date, total_break_time_minutes, smoke_breaks, dinner_breaks, washroom_breaks, prayer_breaks, is_compliant FROM daily_break_summary WHERE user_id = 3 ORDER BY summary_date DESC LIMIT 1;"

echo "" | tee -a "$LOG_FILE"
log "STEP 8: CHECK COMPANY RULES"
test_endpoint "Get Active Company Rule" "GET" "/company-rules/active"

query_db "Check company_rules table" \
  "SELECT id, rule_name, office_start_time, office_end_time, late_mark_time FROM company_rules WHERE is_active = true;"

echo "" | tee -a "$LOG_FILE"
log "STEP 9: TEST LOGOUT"
test_endpoint "Logout" "POST" "/auth/logout" \
  "{\"session_token\":\"$SESSION_TOKEN\",\"reason\":\"Debug test logout\"}" \
  "-H 'Content-Type: application/json'"

# Query session to check if ended
query_db "Check user_sessions after logout" \
  "SELECT id, user_id, ip_address, device_name, login_time, logout_time, is_active FROM user_sessions WHERE id = $SESSION_ID;"

echo "" | tee -a "$LOG_FILE"
log "=========================================="
log "FINAL DATABASE VERIFICATION"
log "=========================================="

query_db "All user_sessions today" \
  "SELECT id, user_id, device_name, login_time, logout_time, is_active FROM user_sessions WHERE DATE(login_time) = CURRENT_DATE ORDER BY id DESC;"

query_db "All employee_breaks today" \
  "SELECT id, user_id, break_type_id, break_start_time, break_end_time, break_status, actual_break_duration_minutes FROM employee_breaks WHERE DATE(break_start_time) = CURRENT_DATE ORDER BY id DESC;"

query_db "All daily_break_summary today" \
  "SELECT user_id, summary_date, total_break_time_minutes, total_breaks_taken, is_compliant FROM daily_break_summary WHERE summary_date = CURRENT_DATE ORDER BY user_id;"

echo "" | tee -a "$LOG_FILE"
log "=========================================="
log "TEST COMPLETE - Log saved to: $LOG_FILE"
log "=========================================="

# Display log file location
echo ""
echo "📋 Complete log saved to: $LOG_FILE"
echo "View with: cat $LOG_FILE"
echo "Follow with: tail -f $LOG_FILE"
