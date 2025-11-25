#!/bin/bash

# Base URL
API_URL="http://localhost:5001/api/allOrders"

echo "Test 1: Default Pagination (Page 1, Limit 10)"
curl -s "$API_URL?page=1&limit=10" | grep -o '"totalOrders":[0-9]*'
echo ""

echo "Test 2: Search by 'DH'"
curl -s "$API_URL?search=DH" | grep -o '"totalOrders":[0-9]*'
echo ""

echo "Test 3: Filter by Status (Pending = 1)"
curl -s "$API_URL?status=1" | grep -o '"totalOrders":[0-9]*'
echo ""

echo "Test 4: Combined Filter (Status 1 + Search 'DH')"
curl -s "$API_URL?status=1&search=DH" | grep -o '"totalOrders":[0-9]*'
echo ""
