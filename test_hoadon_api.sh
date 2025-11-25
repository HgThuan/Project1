#!/bin/bash

# Base URL
API_URL="http://localhost:5001/api/getalldonhang"

echo "Testing /api/getalldonhang..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL")

if [ "$HTTP_CODE" -eq 200 ]; then
    echo "Success: API returned 200 OK"
    curl -s "$API_URL" | head -c 100 # Print first 100 chars of response
    echo "..."
else
    echo "Failed: API returned $HTTP_CODE"
    curl -s "$API_URL"
fi
