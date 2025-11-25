#!/bin/bash

# Invoice Management API Test Script
BASE_URL="http://localhost:5001"

echo "=================================================="
echo "Invoice Management API Test"
echo "=================================================="
echo ""

# Test 1: Create Manual Invoice
echo "Test 1: Creating Manual Invoice..."
MANUAL_INVOICE_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/invoices" \
  -H "Content-Type: application/json" \
  -d '{
    "customerInfo": {
      "name": "Nguyễn Văn Test",
      "phone": "0987654321",
      "address": "123 Test Street, HCM",
      "email": "test@example.com"
    },
    "products": [
      {
        "product_id": "SP001",
        "name": "Test Product 1",
        "quantity": 2,
        "price": 200000,
        "tax": 20000,
        "discount": 10000,
        "color": "Đỏ",
        "size": "L"
      },
      {
        "product_id": "SP002",
        "name": "Test Product 2",
        "quantity": 1,
        "price": 150000,
        "tax": 15000,
        "discount": 5000
      }
    ],
    "paymentMethod": "Tiền mặt",
    "paymentStatus": "Đã thanh toán",
    "notes": "Test manual invoice creation",
    "performedBy": "admin_test"
  }')

echo "$MANUAL_INVOICE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$MANUAL_INVOICE_RESPONSE"
MANUAL_INVOICE_ID=$(echo "$MANUAL_INVOICE_RESPONSE" | grep -o '"ma_hoa_don":"[^"]*"' | cut -d'"' -f4)
echo ""
echo "Created Manual Invoice ID: $MANUAL_INVOICE_ID"
echo ""

# Test 2: Get All Invoices
echo "Test 2: Getting All Invoices..."
curl -s "${BASE_URL}/api/invoices" | python3 -m json.tool 2>/dev/null
echo ""

# Test 3: Get Invoice by ID (if we created one)
if [ -n "$MANUAL_INVOICE_ID" ]; then
  echo "Test 3: Getting Invoice by ID: $MANUAL_INVOICE_ID..."
  curl -s "${BASE_URL}/api/invoices/${MANUAL_INVOICE_ID}" | python3 -m json.tool 2>/dev/null
  echo ""
fi

# Test 4: Filter Invoices by Payment Status
echo "Test 4: Filtering Invoices by Payment Status (Đã thanh toán)..."
curl -s "${BASE_URL}/api/invoices?paymentStatus=Đã%20thanh%20toán" | python3 -m json.tool 2>/dev/null
echo ""

# Test 5: Search Invoices
echo "Test 5: Searching Invoices (Test)..."
curl -s "${BASE_URL}/api/invoices?search=Test" | python3 -m json.tool 2>/dev/null
echo ""

# Test 6: Update Invoice (if we created one)
if [ -n "$MANUAL_INVOICE_ID" ]; then
  echo "Test 6: Updating Invoice..."
  curl -s -X PUT "${BASE_URL}/api/invoices/${MANUAL_INVOICE_ID}" \
    -H "Content-Type: application/json" \
    -d '{
      "paymentStatus": "Chưa thanh toán",
      "notes": "Updated payment status for testing",
      "performedBy": "admin_test"
    }' | python3 -m json.tool 2>/dev/null
  echo ""
fi

# Test 7: Create a test order and approve it to test auto-generation
echo "Test 7: Creating Test Order for Auto Invoice Generation..."
ORDER_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/addOrder" \
  -H "Content-Type: application/json" \
  -d '{
    "ma_khach_hang": "KH001",
    "tong_tien": 500000,
    "ten_khach": "Test Customer Auto Invoice",
    "dia_chi": "456 Auto Test St, HCM",
    "sdt": "0123456789",
    "ghi_chu": "Test order for auto invoice",
    "chi_tiet_don_hang": [
      {
        "ma_san_pham": "SP001",
        "ten_san_pham": "Product Auto Test",
        "so_luong": 2,
        "gia": 250000,
        "mau_sac": "Blue",
        "size": "M"
      }
    ]
  }')

echo "$ORDER_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$ORDER_RESPONSE"
ORDER_ID=$(echo "$ORDER_RESPONSE" | grep -o '"ma_don_hang":"[^"]*"' | cut -d'"' -f4)
echo ""
echo "Created Order ID: $ORDER_ID"
echo ""

# Test 8: Approve the order to trigger auto invoice generation
if [ -n "$ORDER_ID" ]; then
  echo "Test 8: Approving Order to Trigger Auto Invoice Generation..."
  sleep 1
  curl -s -X PUT "${BASE_URL}/api/approveOrder/${ORDER_ID}" \
    -H "Content-Type: application/json" \
    -d '{
      "ten_khach": "Test Customer Auto Invoice",
      "sdt": "0123456789",
      "dia_chi": "456 Auto Test St, HCM"
    }' | python3 -m json.tool 2>/dev/null
  echo ""
  
  echo "Waiting for invoice to be generated..."
  sleep 2
  
  echo "Checking if invoice was auto-generated..."
  curl -s "${BASE_URL}/api/invoices?search=${ORDER_ID}" | python3 -m json.tool 2>/dev/null
  echo ""
fi

# Test 9: Cancel Invoice (if we have a manual invoice)
if [ -n "$MANUAL_INVOICE_ID" ]; then
  echo "Test 9: Cancelling Invoice..."
  curl -s -X POST "${BASE_URL}/api/invoices/cancel/${MANUAL_INVOICE_ID}" \
    -H "Content-Type: application/json" \
    -d '{
      "reason": "Customer requested cancellation for testing",
      "performedBy": "admin_test"
    }' | python3 -m json.tool 2>/dev/null
  echo ""
  
  echo "Verifying cancelled invoice..."
  curl -s "${BASE_URL}/api/invoices/${MANUAL_INVOICE_ID}" | python3 -m json.tool 2>/dev/null
  echo ""
fi

echo "=================================================="
echo "Invoice Management API Tests Completed"
echo "=================================================="
