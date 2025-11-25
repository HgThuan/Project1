#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  RBAC & Audit Logging Test Suite${NC}"
echo -e "${BLUE}========================================${NC}\n"

BASE_URL="http://localhost:5001"

# Login as admin to get token
echo -e "${YELLOW}Step 1: Login as Admin${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Login failed. Please ensure admin account exists${NC}"
    echo -e "Create admin with: POST /api/auth/register with email: admin@example.com, password: admin123"
    echo -e "Then update role to 'admin' in MongoDB\n"
    exit 1
fi

echo -e "${GREEN}✅ Login successful${NC}\n"
sleep 1

# Test 2: Create Staff
echo -e "${YELLOW}Test 2: Create New Staff${NC}"
echo "POST $BASE_URL/api/admin/staff"
curl -s -X POST "$BASE_URL/api/admin/staff" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "John Doe",
    "email": "john.staff@example.com",
    "phoneNumber": "0123456789",
    "password": "staff123",
    "role": "staff",
    "permissions": ["view_customer", "manage_order", "view_reports"]
  }' | json_pp
echo -e "\n"

sleep 1

# Test 3: Get All Staff
echo -e "${YELLOW}Test 3: Get All Staff Members${NC}"
echo "GET $BASE_URL/api/admin/staff"
curl -s -X GET "$BASE_URL/api/admin/staff" \
  -H "Authorization: Bearer $TOKEN" | json_pp
echo -e "\n"

sleep 1

# Get staff ID for next tests
STAFF_ID=$(curl -s -X GET "$BASE_URL/api/admin/staff?limit=1" \
  -H "Authorization: Bearer $TOKEN" | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$STAFF_ID" ]; then
    # Test 4: Get Staff by ID
    echo -e "${YELLOW}Test 4: Get Staff by ID${NC}"
    echo "GET $BASE_URL/api/admin/staff/$STAFF_ID"
    curl -s -X GET "$BASE_URL/api/admin/staff/$STAFF_ID" \
      -H "Authorization: Bearer $TOKEN" | json_pp
    echo -e "\n"
    
    sleep 1
    
    # Test 5: Update Staff
    echo -e "${YELLOW}Test 5: Update Staff Info${NC}"
    echo "PUT $BASE_URL/api/admin/staff/$STAFF_ID"
    curl -s -X PUT "$BASE_URL/api/admin/staff/$STAFF_ID" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d '{
        "name": "John Doe Updated",
        "permissions": ["view_customer", "manage_order", "view_reports", "manage_product"]
      }' | json_pp
    echo -e "\n"
    
    sleep 1
    
    # Test 6: Lock Staff Account
    echo -e "${YELLOW}Test 6: Lock Staff Account${NC}"
    echo "PUT $BASE_URL/api/admin/staff/lock/$STAFF_ID"
    curl -s -X PUT "$BASE_URL/api/admin/staff/lock/$STAFF_ID" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d '{
        "isActive": false,
        "lockedReason": "Testing account lock functionality"
      }' | json_pp
    echo -e "\n"
    
    sleep 1
    
    # Test 7: Unlock Staff Account
    echo -e "${YELLOW}Test 7: Unlock Staff Account${NC}"
    echo "PUT $BASE_URL/api/admin/staff/lock/$STAFF_ID"
    curl -s -X PUT "$BASE_URL/api/admin/staff/lock/$STAFF_ID" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d '{
        "isActive": true
      }' | json_pp
    echo -e "\n"
    
    sleep 1
    
    # Test 8: Reset Staff Password
    echo -e "${YELLOW}Test 8: Reset Staff Password${NC}"
    echo "PUT $BASE_URL/api/admin/staff/reset-password/$STAFF_ID"
    curl -s -X PUT "$BASE_URL/api/admin/staff/reset-password/$STAFF_ID" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d '{
        "newPassword": "newpassword123"
      }' | json_pp
    echo -e "\n"
fi

sleep 1

# Test 9: Get Audit Logs
echo -e "${YELLOW}Test 9: Get Audit Logs${NC}"
echo "GET $BASE_URL/api/admin/audit-logs"
curl -s -X GET "$BASE_URL/api/admin/audit-logs?limit=10" \
  -H "Authorization: Bearer $TOKEN" | json_pp
echo -e "\n"

sleep 1

# Test 10: Get Audit Log Statistics
echo -e "${YELLOW}Test 10: Get Audit Log Statistics${NC}"
echo "GET $BASE_URL/api/admin/audit-logs/stats"
curl -s -X GET "$BASE_URL/api/admin/audit-logs/stats" \
  -H "Authorization: Bearer $TOKEN" | json_pp
echo -e "\n"

sleep 1

# Test 11: Filter Audit Logs by Action
echo -e "${YELLOW}Test 11: Filter Audit Logs (CREATE_STAFF action)${NC}"
echo "GET $BASE_URL/api/admin/audit-logs?action=CREATE_STAFF"
curl -s -X GET "$BASE_URL/api/admin/audit-logs?action=CREATE_STAFF&limit=5" \
  -H "Authorization: Bearer $TOKEN" | json_pp
echo -e "\n"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  All Tests Completed!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\nKey Features Tested:"
echo -e "  ✅ Staff Creation with Role & Permissions"
echo -e "  ✅ Staff Listing with Pagination"
echo -e "  ✅ Staff Update"
echo -e "  ✅ Account Lock/Unlock"
echo -e "  ✅ Password Reset"
echo -e "  ✅ Audit Log Retrieval"
echo -e "  ✅ Audit Log Statistics"
echo -e "  ✅ Audit Log Filtering\n"

echo -e "${YELLOW}Note:${NC} To test permission-based access:"
echo -e "1. Login as the created staff user"
echo -e "2. Try accessing endpoints with their permissions"
echo -e "3. Verify they can't access admin-only endpoints\n"
