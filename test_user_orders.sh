#!/bin/bash

# Base URL
BASE_URL="http://localhost:5001/api"
# Use a test user ID - replace with an actual user ID from your database
USER_ID="673f48a129184285257d078b"

echo "Testing GET /api/orders/user/:userId endpoint..."
echo "User ID: $USER_ID"
echo ""

# Test the endpoint
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/orders/user/$USER_ID")

# Extract HTTP code (last line)
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)

# Extract body (all but last line)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status Code: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" -eq 200 ]; then
    echo "✓ Success: Endpoint returned 200 OK"
    echo ""
    echo "Response (formatted):"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
else
    echo "✗ Failed: Endpoint returned $HTTP_CODE"
    echo ""
    echo "Response:"
    echo "$BODY"
fi
