#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Invoice Analytics API Test Suite${NC}"
echo -e "${BLUE}========================================${NC}\n"

BASE_URL="http://localhost:5001"

# Test 1: Get Dashboard Statistics
echo -e "${YELLOW}Test 1: Get Dashboard Statistics${NC}"
echo "GET $BASE_URL/api/stats/dashboard"
curl -s -X GET "$BASE_URL/api/stats/dashboard" \
  -H "Content-Type: application/json" | json_pp
echo -e "\n"

sleep 1

# Test 2: Get Invoice Statistics (Monthly)
echo -e "${YELLOW}Test 2: Get Invoice Statistics (Monthly View)${NC}"
echo "GET $BASE_URL/api/stats/invoices?period=month"
curl -s -X GET "$BASE_URL/api/stats/invoices?period=month" \
  -H "Content-Type: application/json" | json_pp
echo -e "\n"

sleep 1

# Test 3: Get Invoice Statistics (Daily)
echo -e "${YELLOW}Test 3: Get Invoice Statistics (Daily View)${NC}"
echo "GET $BASE_URL/api/stats/invoices?period=day"
curl -s -X GET "$BASE_URL/api/stats/invoices?period=day" \
  -H "Content-Type: application/json" | json_pp
echo -e "\n"

sleep 1

# Test 4: Get Invoice Statistics (Yearly)
echo -e "${YELLOW}Test 4: Get Invoice Statistics (Yearly View)${NC}"
echo "GET $BASE_URL/api/stats/invoices?period=year"
curl -s -X GET "$BASE_URL/api/stats/invoices?period=year" \
  -H "Content-Type: application/json" | json_pp
echo -e "\n"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  All Tests Completed!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\nNow check the Dashboard at: http://localhost:3001/"
echo -e "You should see:"
echo -e "  ✓ Monthly and Yearly Revenue cards"
echo -e "  ✓ Outstanding Amount card"
echo -e "  ✓ Refunded Amount card"
echo -e "  ✓ Revenue Over Time Line Chart"
echo -e "  ✓ Payment Method Distribution Pie Chart"
echo -e "  ✓ Invoice Status Breakdown\n"
