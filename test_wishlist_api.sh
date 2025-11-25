#!/bin/bash

# Test Wishlist API
# Note: This requires a valid User ID and Product ID. 
# I will use dummy IDs to check if the route is reachable (expecting 400 or 500 if IDs are invalid, but not 404).

USER_ID="655e2b..." # Dummy
PRODUCT_ID="SP001"

echo "Testing Wishlist Toggle Endpoint (Expect 400/500 or success)..."
curl -X POST "http://localhost:5001/api/wishlist/toggle" \
     -H "Content-Type: application/json" \
     -d "{\"userId\": \"$USER_ID\", \"productId\": \"$PRODUCT_ID\"}"
echo -e "\n"

echo "Testing Get Wishlist Endpoint (Expect success or empty)..."
curl -X GET "http://localhost:5001/api/wishlist/$USER_ID"
echo -e "\n"
