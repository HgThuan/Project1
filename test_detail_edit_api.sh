#!/bin/bash

# Base URL
BASE_URL="http://localhost:5001/api"
ORDER_ID="DH2511227182" # Example ID from logs

echo "Testing /api/getctdh/$ORDER_ID..."
HTTP_CODE_CTDH=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/getctdh/$ORDER_ID")

if [ "$HTTP_CODE_CTDH" -eq 200 ]; then
    echo "Success: /api/getctdh returned 200 OK"
else
    echo "Failed: /api/getctdh returned $HTTP_CODE_CTDH"
fi

echo "Testing /api/gethd/$ORDER_ID..."
HTTP_CODE_HD=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/gethd/$ORDER_ID")

if [ "$HTTP_CODE_HD" -eq 200 ]; then
    echo "Success: /api/gethd returned 200 OK"
else
    echo "Failed: /api/gethd returned $HTTP_CODE_HD"
fi
