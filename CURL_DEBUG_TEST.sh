#!/bin/bash

# Simple curl debug test
LOG_FILE="/tmp/curl_test_$(date +%s).log"

{
  echo "====== CURL TEST WITH DATABASE VERIFICATION ======"
  echo "Log: $LOG_FILE"
  echo "Time: $(date)"
  echo ""
  
  # TEST 1: LOGIN
  echo "TEST 1: LOGIN"
  echo "================================"
  LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -H "x-device-name: Curl-Test-$(date +%s)" \
    -d '{"email":"employee@digious.com","password":"emp123"}' 2>&1)
  
  echo "Response:"
  echo "$LOGIN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$LOGIN_RESPONSE"
  
  SESSION_ID=$(echo "$LOGIN_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  SESSION_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"sessionToken":"[^"]*' | head -1 | cut -d'"' -f4)
  
  echo ""
  echo "Session ID: $SESSION_ID"
  echo "Session Token: ${SESSION_TOKEN:0:30}..."
  echo ""
  
  # Verify in database
  echo "DATABASE CHECK - user_sessions"
  PGPASSWORD='digious123' psql -h localhost -U digious_user -d digious_crm -t \
    -c "SELECT id, user_id, ip_address, device_name, login_time, logout_time, is_active FROM user_sessions WHERE id = $SESSION_ID;"
  echo ""
  
  # TEST 2: GET BREAK TYPES
  echo "TEST 2: GET BREAK TYPES"
  echo "================================"
  BREAKS_RESPONSE=$(curl -s -X GET http://localhost:5000/api/v1/breaks/types 2>&1)
  echo "Response:"
  echo "$BREAKS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$BREAKS_RESPONSE"
  echo ""
  
  # Verify in database
  echo "DATABASE CHECK - break_types"
  PGPASSWORD='digious123' psql -h localhost -U digious_user -d digious_crm -t \
    -c "SELECT id, break_name, duration_minutes, allowed_per_day FROM break_types ORDER BY id;"
  echo ""
  
  # TEST 3: DELETE OLD BREAKS (for fresh test)
  echo "TEST 3: CLEANING UP OLD BREAKS FOR USER 3"
  echo "================================"
  echo "Deleting breaks from today for fresh test..."
  PGPASSWORD='digious123' psql -h localhost -U digious_user -d digious_crm -t \
    -c "DELETE FROM employee_breaks WHERE user_id = 3 AND DATE(break_start_time) = CURRENT_DATE;"
  echo "Deleted."
  echo ""
  
  # TEST 4: START BREAK
  echo "TEST 4: START BREAK"
  echo "================================"
  START_BREAK=$(curl -s -X POST http://localhost:5000/api/v1/breaks/start \
    -H "Content-Type: application/json" \
    -d '{"user_id":3,"break_type_id":1,"notes":"Curl test break"}' 2>&1)
  
  echo "Response:"
  echo "$START_BREAK" | python3 -m json.tool 2>/dev/null || echo "$START_BREAK"
  
  BREAK_ID=$(echo "$START_BREAK" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  echo ""
  echo "Break ID: $BREAK_ID"
  echo ""
  
  # Verify in database
  echo "DATABASE CHECK - employee_breaks"
  PGPASSWORD='digious123' psql -h localhost -U digious_user -d digious_crm -t \
    -c "SELECT id, user_id, break_type_id, break_start_time, break_end_time, break_status FROM employee_breaks WHERE id = $BREAK_ID;"
  echo ""
  
  # TEST 5: GET ACTIVE BREAK
  echo "TEST 5: GET ACTIVE BREAK"
  echo "================================"
  ACTIVE_BREAK=$(curl -s -X GET http://localhost:5000/api/v1/breaks/active/3 2>&1)
  
  echo "Response:"
  echo "$ACTIVE_BREAK" | python3 -m json.tool 2>/dev/null || echo "$ACTIVE_BREAK"
  echo ""
  
  # TEST 6: WAIT & END BREAK
  echo "TEST 6: WAIT 3 SECONDS THEN END BREAK"
  echo "================================"
  sleep 3
  
  END_BREAK=$(curl -s -X POST http://localhost:5000/api/v1/breaks/end \
    -H "Content-Type: application/json" \
    -d '{"user_id":3}' 2>&1)
  
  echo "Response:"
  echo "$END_BREAK" | python3 -m json.tool 2>/dev/null || echo "$END_BREAK"
  echo ""
  
  # Verify break ended in database
  echo "DATABASE CHECK - employee_breaks after end"
  PGPASSWORD='digious123' psql -h localhost -U digious_user -d digious_crm -t \
    -c "SELECT id, user_id, break_type_id, break_start_time, break_end_time, break_status, actual_break_duration_minutes FROM employee_breaks WHERE id = $BREAK_ID;"
  echo ""
  
  # TEST 7: GET BREAK SUMMARY
  echo "TEST 7: GET DAILY BREAK SUMMARY"
  echo "================================"
  SUMMARY=$(curl -s -X GET http://localhost:5000/api/v1/breaks/summary/3 2>&1)
  
  echo "Response:"
  echo "$SUMMARY" | python3 -m json.tool 2>/dev/null || echo "$SUMMARY"
  echo ""
  
  # Verify in database  
  echo "DATABASE CHECK - daily_break_summary"
  PGPASSWORD='digious123' psql -h localhost -U digious_user -d digious_crm -t \
    -c "SELECT user_id, total_break_time_minutes, total_breaks_taken, smoke_breaks, is_compliant FROM daily_break_summary WHERE user_id = 3 ORDER BY created_at DESC LIMIT 1;"
  echo ""
  
  # TEST 8: GET COMPANY RULES
  echo "TEST 8: GET COMPANY RULES"
  echo "================================"
  RULES=$(curl -s -X GET http://localhost:5000/api/v1/company-rules/active 2>&1)
  
  echo "Response:"
  echo "$RULES" | python3 -m json.tool 2>/dev/null || echo "$RULES"
  echo ""
  
  # TEST 9: LOGOUT
  echo "TEST 9: LOGOUT"
  echo "================================"
  LOGOUT=$(curl -s -X POST http://localhost:5000/api/v1/auth/logout \
    -H "Content-Type: application/json" \
    -d "{\"session_token\":\"$SESSION_TOKEN\",\"reason\":\"Curl test logout\"}" 2>&1)
  
  echo "Response:"
  echo "$LOGOUT" | python3 -m json.tool 2>/dev/null || echo "$LOGOUT"
  echo ""
  
  # Verify logout in database
  echo "DATABASE CHECK - user_sessions after logout"
  PGPASSWORD='digious123' psql -h localhost -U digious_user -d digious_crm -t \
    -c "SELECT id, user_id, ip_address, device_name, login_time, logout_time, is_active FROM user_sessions WHERE id = $SESSION_ID;"
  echo ""
  
  # FINAL: ALL SESSIONS AND BREAKS
  echo "FINAL SUMMARY"
  echo "================================"
  echo "All sessions today:"
  PGPASSWORD='digious123' psql -h localhost -U digious_user -d digious_crm \
    -c "SELECT id, user_id, device_name, login_time, logout_time, is_active FROM user_sessions WHERE DATE(login_time) = CURRENT_DATE ORDER BY id DESC LIMIT 5;"
  echo ""
  
  echo "All breaks today:"
  PGPASSWORD='digious123' psql -h localhost -U digious_user -d digious_crm \
    -c "SELECT id, user_id, break_type_id, break_start_time, break_end_time, break_status, actual_break_duration_minutes FROM employee_breaks WHERE DATE(break_start_time) = CURRENT_DATE ORDER BY id DESC;"
  echo ""
  
  echo "====== TEST COMPLETE ======"
  
} | tee "$LOG_FILE"

echo ""
echo "✅ Log saved to: $LOG_FILE"
