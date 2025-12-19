#!/bin/bash

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Database credentials
DB_HOST="localhost"
DB_USER="digious_user"
DB_NAME="digious_crm"
DB_PASSWORD="digious123"

# API base URL
API_URL="http://localhost:5000/api/v1"

echo -e "\n${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   COMPREHENSIVE DEBUG TEST WITH DATABASE VERIFICATION${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}\n"

# Test 1: LOGIN AND VERIFY SESSION
echo -e "${YELLOW}TEST 1: LOGIN AND VERIFY SESSION IN DATABASE${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}\n"

echo -e "${BLUE}Step 1: Calling login endpoint...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -H "x-device-name: Laptop-Chrome-Test" \
  -d '{"email": "employee@digious.com", "password": "emp123"}')

echo -e "${GREEN}Login Response:${NC}"
echo "$LOGIN_RESPONSE" | jq .

# Extract session ID and token
SESSION_ID=$(echo "$LOGIN_RESPONSE" | jq -r '.data.session.id // empty')
SESSION_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.sessionToken // empty')
JWT_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token // empty')

echo -e "\n${BLUE}Extracted Values:${NC}"
echo "  Session ID: ${GREEN}$SESSION_ID${NC}"
echo "  Session Token: ${GREEN}${SESSION_TOKEN:0:20}...${NC}"
echo "  JWT Token: ${GREEN}${JWT_TOKEN:0:30}...${NC}"

if [ -z "$SESSION_ID" ]; then
  echo -e "${RED}❌ Failed to extract session ID from response${NC}\n"
  exit 1
fi

echo -e "\n${BLUE}Step 2: Querying user_sessions table in database...${NC}"
DB_SESSION=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -t -c \
  "SELECT id, user_id, ip_address, device_name, login_time, is_active FROM user_sessions WHERE id = $SESSION_ID;")

if [ -z "$DB_SESSION" ]; then
  echo -e "${RED}❌ NO SESSION FOUND IN DATABASE!${NC}"
  echo -e "${YELLOW}Query result: (empty)${NC}\n"
else
  echo -e "${GREEN}✅ Session found in database:${NC}"
  echo "$DB_SESSION"
fi

# Test 2: START BREAK
echo -e "\n${YELLOW}TEST 2: START SMOKE BREAK AND VERIFY${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}\n"

echo -e "${BLUE}Step 1: Calling start break endpoint...${NC}"
BREAK_START=$(curl -s -X POST "$API_URL/breaks/start" \
  -H "Content-Type: application/json" \
  -d "{\"user_id\": 3, \"break_type_id\": 1, \"notes\": \"Debug test break\"}")

echo -e "${GREEN}Break Start Response:${NC}"
echo "$BREAK_START" | jq .

BREAK_ID=$(echo "$BREAK_START" | jq -r '.data.id // empty')
BREAK_STATUS=$(echo "$BREAK_START" | jq -r '.data.break_status // empty')

echo -e "\n${BLUE}Extracted Values:${NC}"
echo "  Break ID: ${GREEN}$BREAK_ID${NC}"
echo "  Break Status: ${GREEN}$BREAK_STATUS${NC}"

if [ -z "$BREAK_ID" ]; then
  echo -e "${RED}❌ Failed to extract break ID from response${NC}\n"
  exit 1
fi

echo -e "\n${BLUE}Step 2: Querying employee_breaks table in database...${NC}"
DB_BREAK=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -t -c \
  "SELECT id, user_id, break_type_id, break_status, break_start_time FROM employee_breaks WHERE id = $BREAK_ID;")

if [ -z "$DB_BREAK" ]; then
  echo -e "${RED}❌ NO BREAK RECORD FOUND IN DATABASE!${NC}"
  echo -e "${YELLOW}Query result: (empty)${NC}\n"
else
  echo -e "${GREEN}✅ Break record found in database:${NC}"
  echo "$DB_BREAK"
fi

# Test 3: END BREAK
echo -e "\n${YELLOW}TEST 3: END BREAK AND VERIFY${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}\n"

echo -e "${BLUE}Step 1: Sleeping 3 seconds to create break duration...${NC}"
sleep 3

echo -e "${BLUE}Step 2: Calling end break endpoint...${NC}"
BREAK_END=$(curl -s -X POST "$API_URL/breaks/end" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 3}')

echo -e "${GREEN}Break End Response:${NC}"
echo "$BREAK_END" | jq .

echo -e "\n${BLUE}Step 3: Querying employee_breaks table after end...${NC}"
DB_BREAK_AFTER=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -t -c \
  "SELECT id, user_id, break_status, break_start_time, break_end_time, actual_break_duration_minutes FROM employee_breaks WHERE id = $BREAK_ID;")

if [ -z "$DB_BREAK_AFTER" ]; then
  echo -e "${RED}❌ NO BREAK RECORD FOUND AFTER END!${NC}"
else
  echo -e "${GREEN}✅ Break record after end:${NC}"
  echo "$DB_BREAK_AFTER"
fi

# Test 4: VERIFY DAILY BREAK SUMMARY
echo -e "\n${YELLOW}TEST 4: VERIFY DAILY BREAK SUMMARY${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}\n"

echo -e "${BLUE}Step 1: Calling break summary endpoint...${NC}"
BREAK_SUMMARY=$(curl -s -X GET "$API_URL/breaks/summary/3" \
  -H "Content-Type: application/json")

echo -e "${GREEN}Break Summary Response:${NC}"
echo "$BREAK_SUMMARY" | jq .

echo -e "\n${BLUE}Step 2: Querying daily_break_summary table in database...${NC}"
DB_SUMMARY=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -t -c \
  "SELECT user_id, summary_date, total_break_time_minutes, total_breaks_taken, is_compliant FROM daily_break_summary WHERE user_id = 3 AND DATE(summary_date) = CURRENT_DATE;")

if [ -z "$DB_SUMMARY" ]; then
  echo -e "${YELLOW}⚠️  No summary record found for today${NC}"
else
  echo -e "${GREEN}✅ Daily break summary found in database:${NC}"
  echo "$DB_SUMMARY"
fi

# Test 5: VERIFY ACTIVE SESSIONS
echo -e "\n${YELLOW}TEST 5: VERIFY ACTIVE SESSIONS${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}\n"

echo -e "${BLUE}Step 1: Calling active sessions endpoint...${NC}"
ACTIVE_SESSIONS=$(curl -s -X GET "$API_URL/sessions/active" \
  -H "Content-Type: application/json")

echo -e "${GREEN}Active Sessions Response (first 3):${NC}"
echo "$ACTIVE_SESSIONS" | jq '.data[0:3]'

echo -e "\n${BLUE}Step 2: Querying user_sessions table for active sessions...${NC}"
DB_ACTIVE=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -t -c \
  "SELECT COUNT(*) as active_count FROM user_sessions WHERE is_active = true;")

echo -e "${GREEN}Active sessions count in database:${NC}"
echo "$DB_ACTIVE"

# Test 6: VALIDATE SESSION TOKEN
echo -e "\n${YELLOW}TEST 6: VALIDATE SESSION TOKEN${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}\n"

echo -e "${BLUE}Step 1: Validating session token...${NC}"
VALIDATE=$(curl -s -X POST "$API_URL/sessions/validate" \
  -H "Content-Type: application/json" \
  -d "{\"session_token\": \"$SESSION_TOKEN\"}")

echo -e "${GREEN}Validation Response:${NC}"
echo "$VALIDATE" | jq .

# Final Summary
echo -e "\n${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   TEST SUMMARY${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}\n"

echo -e "${GREEN}Session ID: $SESSION_ID${NC}"
echo -e "${GREEN}Break ID: $BREAK_ID${NC}"
echo -e "${GREEN}Break Status: $BREAK_STATUS${NC}"

# Count total records
TOTAL_SESSIONS=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -t -c \
  "SELECT COUNT(*) FROM user_sessions;")

TOTAL_BREAKS=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -t -c \
  "SELECT COUNT(*) FROM employee_breaks;")

echo -e "\n${BLUE}Database Summary:${NC}"
echo -e "  Total Sessions: ${GREEN}$TOTAL_SESSIONS${NC}"
echo -e "  Total Breaks: ${GREEN}$TOTAL_BREAKS${NC}"

echo -e "\n${BLUE}════════════════════════════════════════════════════════${NC}\n"
