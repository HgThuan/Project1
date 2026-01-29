# VNPay Payment Integration with ngrok - Setup Guide

## Prerequisites
- ngrok installed ✅
- Backend server running on port 5001
- Frontend running on port 3000

## Step 1: Start ngrok Tunnel

Run the following command to start ngrok:

```bash
ngrok http 5001
```

You'll see output like:
```
ngrok                                                                                                                                        

Session Status                online
Account                       Your Account (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:5001

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**Copy the HTTPS URL** (e.g., `https://abc123.ngrok-free.app`)

## Step 2: Update Environment Variables

Update the `.env` file in `/Users/Shared/Dev/Project1/backend/server/.env`:

```env
NGROK_URL=https://your-copied-ngrok-url.ngrok-free.app
```

**Important:** Do NOT include a trailing slash!

## Step 3: Restart Backend Server

Stop the current backend server (Ctrl+C) and restart it:

```bash
cd /Users/Shared/Dev/Project1/backend/server
npm run server
```

The server will now use the new ngrok URL for VNPay callbacks.

## Step 4: Configure VNPay IPN URL (Important!)

VNPay needs to know where to send payment notifications. You have two options:

### Option A: Configure in VNPay Merchant Portal (Recommended for Production)
1. Log in to VNPay Merchant Portal
2. Go to Settings → IPN Configuration
3. Set IPN URL to: `https://your-ngrok-url.ngrok-free.app/api/vnpay_ipn`

### Option B: Test Mode (Current Setup)
For sandbox/testing, VNPay typically uses the return URL. Make sure:
- VNPAY_RETURN_URL in `.env` points to your frontend: `http://localhost:3000/order-success`

## Step 5: Test Payment Flow

1. **Navigate to cart**: http://localhost:3000/cart
2. **Add items to cart** (if empty)
3. **Fill in shipping information**:
   - Name, phone, address
   - Province, district, ward
4. **Select VNPay payment method**
5. **Click "Thanh toán"**
6. **You'll be redirected to VNPay sandbox**
7. **Use test card credentials**:
   - Card Number: `9704198526191432198`
   - Card Holder: `NGUYEN VAN A`
   - Issue Date: `07/15`
   - OTP: `123456`
8. **Complete payment**
9. **You should be redirected back to**: http://localhost:3000/order-success
10. **Verify order status updated** in database

## Monitoring

### Backend Logs
Watch backend console for:
```
[VNPay] Payment URL created for order ORDER_ID, amount: XXXX VND
[VNPay IPN] Received for order ORDER_ID, Response: 00
[VNPay IPN] Order ORDER_ID payment confirmed. Amount: XXXX VND
```

### ngrok Web Interface
Open http://127.0.0.1:4040 to see all HTTP requests including VNPay callbacks.

## Troubleshooting

### Issue: Payment successful but order status not updated
- Check ngrok logs at http://127.0.0.1:4040
- Verify IPN callback received
- Check backend logs for errors

### Issue: Redirect fails after payment
- Verify VNPAY_RETURN_URL is correct in `.env`
- Make sure frontend is running on port 3000
- Check browser console for errors

### Issue: "Invalid signature" error
- Verify VNPAY_HASH_SECRET matches VNPay portal settings
- Check that environment variables loaded correctly (restart server)

### Issue: ngrok URL changes frequently
- Use ngrok with auth token for persistent URLs
- Consider upgrading to ngrok paid plan for reserved domains
- Update `.env` each time ngrok restarts

## VNPay Response Codes

- `00`: Success
- `07`: Suspicious transaction
- `09`: Card not registered for internet banking
- `10`: Authentication failed
- `11`: Timeout
- `12`: Card locked
- `13`: Wrong OTP
- `24`: Transaction cancelled
- `51`: Insufficient balance
- `65`: Daily limit exceeded
- `75`: Bank under maintenance
- `79`: Transaction timeout

## Next Steps

1. Test different payment scenarios (success, failure, cancellation)
2. Verify order status updates correctly
3. Test order tracking after payment
4. Monitor IPN callback responses
5. Consider setting up ngrok with auth token for more stable URLs

## Production Deployment

For production:
1. Replace ngrok with your actual domain
2. Update VNPay IPN URL in merchant portal
3. Use production VNPay credentials (not sandbox)
4. Implement webhook signature verification
5. Add proper error monitoring and logging
