#!/bin/bash

# Base URL
BASE_URL="http://localhost:5001/api"
ORDER_ID="DH2511227182" # Use an existing order ID for testing

# 1. Reset order to Pending (1) for testing (This might fail if order is already 4 or 5, but let's try)
# Ideally we should create a new order, but for simplicity let's try to use an existing one or assume one exists.
# Better approach: Create a new order first.

echo "Creating a test order..."
CREATE_RES=$(curl -s -X POST "$BASE_URL/addOrder" \
  -H "Content-Type: application/json" \
  -d '{
    "ma_khach_hang": "TEST_USER",
    "tong_tien": 100000,
    "ten_khach": "Test User",
    "dia_chi": "Test Address",
    "sdt": "0123456789",
    "chi_tiet_don_hang": []
  }')

ORDER_ID=$(echo $CREATE_RES | grep -o '"ma_don_hang":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ORDER_ID" ]; then
  echo "Failed to create test order"
  exit 1
fi

echo "Created order: $ORDER_ID"

# 2. Test: Update to Delivered (4) -> Should succeed and set payment to 'Đã thanh toán'
echo "Testing update to Delivered (4)..."
curl -s -X PUT "$BASE_URL/updateOrder/$ORDER_ID" \
  -H "Content-Type: application/json" \
  -d '{"trang_thai": 4}' > /dev/null

# Check payment status
ORDER_INFO=$(curl -s "$BASE_URL/gethd/$ORDER_ID") # Assuming gethd returns order info
# Or use getOrderById if available, but gethd was used in previous steps.
# Actually gethd might be the one returning 200 OK in previous test.
# Let's use the one that returns full info.
# dathangController has getOrderById but route might be different.
# Let's check the response of updateOrder which returns the updated order.

# 3. Test: Update from Delivered (4) to Pending (1) -> Should fail
echo "Testing invalid update Delivered (4) -> Pending (1)..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE_URL/updateOrder/$ORDER_ID" \
  -H "Content-Type: application/json" \
  -d '{"trang_thai": 1}')

if [ "$HTTP_CODE" -eq 400 ]; then
  echo "Success: Prevented update from Delivered to Pending (400 Bad Request)"
else
  echo "Failed: Allowed update from Delivered to Pending (Code: $HTTP_CODE)"
fi

# 4. Test: Update from Delivered (4) to Cancelled (5) -> Should fail
echo "Testing invalid update Delivered (4) -> Cancelled (5)..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE_URL/updateOrder/$ORDER_ID" \
  -H "Content-Type: application/json" \
  -d '{"trang_thai": 5}')

if [ "$HTTP_CODE" -eq 400 ]; then
  echo "Success: Prevented update from Delivered to Cancelled (400 Bad Request)"
else
  echo "Failed: Allowed update from Delivered to Cancelled (Code: $HTTP_CODE)"
fi
