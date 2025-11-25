#!/bin/bash

# Base URL
API_URL="http://localhost:5001/api/order/track"

# Test Case 1: Missing fields
echo "Test 1: Missing fields"
curl -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d '{}'
echo -e "\n"

# Test Case 2: Invalid Order
echo "Test 2: Invalid Order"
curl -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d '{"ma_don_hang": "INVALID", "sdt": "0000000000"}'
echo -e "\n"

# To test success, we need a valid order. 
# You can manually replace these values if you know a valid order.
# echo "Test 3: Valid Order (Placeholder)"
# curl -X POST $API_URL \
#   -H "Content-Type: application/json" \
#   -d '{"ma_don_hang": "DH2311221234", "sdt": "0987654321"}'
# echo -e "\n"
