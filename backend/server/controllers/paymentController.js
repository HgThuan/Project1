const crypto = require('crypto');
const querystring = require('querystring');
const DatHang = require('../models/dathang');

// VNPay Configuration from environment variables
const vnp_TmnCode = process.env.VNPAY_TMN_CODE;
const vnp_HashSecret = process.env.VNPAY_HASH_SECRET;
const vnp_Url = process.env.VNPAY_URL;
const vnp_ReturnUrl = process.env.VNPAY_RETURN_URL;

/**
 * Sort object by key alphabetically
 */
function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(key);
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

/**
 * Create VNPay Payment URL
 * POST /api/create_payment_url
 */
exports.createPaymentUrl = async (req, res) => {
    try {
        const { amount, orderInfo, orderId, customerName, orderData } = req.body;

        // Validate required fields
        if (!amount || !orderInfo || !orderId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters: amount, orderInfo, orderId'
            });
        }

        // Ensure amount is valid number
        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount'
            });
        }

        // Get current date/time in GMT+7 (Vietnam Time)
        const date = new Date();
        const vnDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
        const createDate = vnDate.getFullYear().toString() +
            ('0' + (vnDate.getMonth() + 1)).slice(-2) +
            ('0' + vnDate.getDate()).slice(-2) +
            ('0' + vnDate.getHours()).slice(-2) +
            ('0' + vnDate.getMinutes()).slice(-2) +
            ('0' + vnDate.getSeconds()).slice(-2);

        // Get client IP address
        const ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress ||
            '127.0.0.1';

        // Build VNPay parameters (values NOT encoded yet)
        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = vnp_TmnCode;
        vnp_Params['vnp_Locale'] = 'vn';
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = orderInfo;
        vnp_Params['vnp_OrderType'] = 'other';
        // Ensure amount is an integer
        const vnp_Amount = Math.floor(amount * 100);
        vnp_Params['vnp_Amount'] = vnp_Amount;

        // Ensure IP is IPv4 or default
        if (ipAddr && ipAddr.includes(':')) {
            vnp_Params['vnp_IpAddr'] = '127.0.0.1'; // Sandbox often prefers IPv4
        }

        // Manual Sort & Build Query String (Robust Method)
        // 1. Sort keys
        const sortedKeys = Object.keys(vnp_Params).sort();

        // 2. Build signData (and encoded params object for final URL) with encoded values
        let signData = '';
        const encodedParams = {};

        sortedKeys.forEach((key, index) => {
            const rawValue = vnp_Params[key];
            // Encode value (replace space with +)
            const encodedValue = encodeURIComponent(rawValue).replace(/%20/g, "+");

            encodedParams[key] = encodedValue;

            if (index > 0) {
                signData += '&';
            }
            signData += key + '=' + encodedValue;
        });

        console.log("VNPay Sign Data:", signData);

        // Generate secure hash using HMAC SHA512
        const hmac = crypto.createHmac("sha512", vnp_HashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        // Add secure hash to params
        encodedParams['vnp_SecureHash'] = signed;

        // Build final payment URL
        // We manually build this to avoid any double encoding issues from libraries
        let queryParams = '';
        Object.keys(encodedParams).forEach((key, index) => {
            if (index > 0) queryParams += '&';
            queryParams += key + '=' + encodedParams[key];
        });

        const paymentUrl = vnp_Url + '?' + queryParams;

        console.log(`[VNPay] Payment URL created for order ${orderId}, amount: ${amount} VND`);

        res.status(200).json({
            success: true,
            paymentUrl: paymentUrl,
            transactionRef: orderId
        });

    } catch (error) {
        console.error('Error creating VNPay payment URL:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating payment URL',
            error: error.message
        });
    }
};

/**
 * Handle VNPay IPN (Instant Payment Notification) callback
 * This endpoint is called by VNPay server after payment
 */
exports.vnpayIPN = async (req, res) => {
    try {
        let vnp_Params = req.query;
        const secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);

        const signData = querystring.stringify(vnp_Params, null, null, { encodeURIComponent: str => str });
        const hmac = crypto.createHmac("sha512", vnp_HashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        if (secureHash === signed) {
            const orderId = vnp_Params['vnp_TxnRef'];
            const rspCode = vnp_Params['vnp_ResponseCode'];
            const amount = vnp_Params['vnp_Amount'] / 100; // Convert back from smallest unit
            const transactionNo = vnp_Params['vnp_TransactionNo'];
            const bankCode = vnp_Params['vnp_BankCode'];
            const payDate = vnp_Params['vnp_PayDate'];

            console.log(`[VNPay IPN] Received for order ${orderId}, Response: ${rspCode}`);

            // Update order status in database
            try {
                const order = await DatHang.findOne({ ma_don_hang: orderId });

                if (!order) {
                    console.error(`[VNPay IPN] Order ${orderId} not found`);
                    return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
                }

                if (rspCode === '00') {
                    // Payment successful
                    order.thanh_toan = 'Đã thanh toán';
                    order.trang_thai = 2; // Move to next status (Preparing)
                    await order.save();

                    console.log(`[VNPay IPN] Order ${orderId} payment confirmed. Amount: ${amount} VND`);
                    res.status(200).json({ RspCode: '00', Message: 'success' });
                } else {
                    // Payment failed
                    console.log(`[VNPay IPN] Payment failed for order ${orderId}. Code: ${rspCode}`);
                    res.status(200).json({ RspCode: '00', Message: 'success' }); // Still return success to VNPay
                }
            } catch (dbError) {
                console.error('[VNPay IPN] Database error:', dbError);
                res.status(200).json({ RspCode: '99', Message: 'Database error' });
            }
        } else {
            console.error('[VNPay IPN] Checksum failed');
            res.status(200).json({ RspCode: '97', Message: 'Checksum failed' });
        }
    } catch (error) {
        console.error('VNPay IPN Error:', error);
        res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
    }
};

/**
 * Handle VNPay return after payment
 * This is where user is redirected after completing payment on VNPay
 */
exports.vnpayReturn = async (req, res) => {
    try {
        let vnp_Params = req.query;
        const secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);

        const signData = querystring.stringify(vnp_Params, null, null, { encodeURIComponent: str => str });
        const hmac = crypto.createHmac("sha512", vnp_HashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        if (secureHash === signed) {
            const rspCode = vnp_Params['vnp_ResponseCode'];
            const orderId = vnp_Params['vnp_TxnRef'];

            // Return data to frontend
            res.status(200).json({
                success: rspCode === '00',
                code: rspCode,
                orderId: orderId,
                message: rspCode === '00' ? 'Payment successful' : 'Payment failed'
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid signature'
            });
        }
    } catch (error) {
        console.error('VNPay Return Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing return',
            error: error.message
        });
    }
};

/**
 * Create MoMo Payment URL
 */
exports.createMomoPayment = async (req, res) => {
    try {
        const { amount, orderInfo, orderId } = req.body;

        // Config from env
        const partnerCode = process.env.MOMO_PARTNER_CODE;
        const accessKey = process.env.MOMO_ACCESS_KEY;
        const secretKey = process.env.MOMO_SECRET_KEY;
        const redirectUrl = process.env.MOMO_REDIRECT_URL;
        const ipnUrl = process.env.MOMO_IPN_URL;
        const requestType = "payWithMethod";
        const extraData = "";
        const orderGroupId = "";
        const autoCapture = true;
        const lang = 'vi';

        const requestId = orderId;

        // Format signature string
        const rawSignature = "accessKey=" + accessKey +
            "&amount=" + amount +
            "&extraData=" + extraData +
            "&ipnUrl=" + ipnUrl +
            "&orderId=" + orderId +
            "&orderInfo=" + orderInfo +
            "&partnerCode=" + partnerCode +
            "&redirectUrl=" + redirectUrl +
            "&requestId=" + requestId +
            "&requestType=" + requestType;

        // Create signature
        const crypto = require('crypto');
        const signature = crypto.createHmac('sha256', secretKey)
            .update(rawSignature)
            .digest('hex');

        // Request body
        const requestBody = JSON.stringify({
            partnerCode: partnerCode,
            partnerName: "Test",
            storeId: "MomoTestStore",
            requestId: requestId,
            amount: amount,
            orderId: orderId,
            orderInfo: orderInfo,
            redirectUrl: redirectUrl,
            ipnUrl: ipnUrl,
            lang: lang,
            requestType: requestType,
            autoCapture: autoCapture,
            extraData: extraData,
            orderGroupId: orderGroupId,
            signature: signature
        });

        // HTTP Request options
        const https = require('https');
        const options = {
            hostname: 'test-payment.momo.vn',
            port: 443,
            path: '/v2/gateway/api/create',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(requestBody)
            }
        };

        // Send request
        const request = https.request(options, response => {
            let data = '';

            response.setEncoding('utf8');
            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                try {
                    const parsedBody = JSON.parse(data);
                    console.log("[MoMo] Response:", parsedBody);

                    if (parsedBody.resultCode === 0) {
                        res.status(200).json({
                            success: true,
                            payUrl: parsedBody.payUrl,
                            shortLink: parsedBody.shortLink,
                            message: 'Successfully created MoMo payment'
                        });
                    } else {
                        res.status(400).json({
                            success: false,
                            message: parsedBody.message || 'MoMo payment creation failed',
                            resultCode: parsedBody.resultCode
                        });
                    }
                } catch (e) {
                    res.status(500).json({
                        success: false,
                        message: 'Error parsing MoMo response',
                        error: e.message
                    });
                }
            });
        });

        request.on('error', (e) => {
            console.error(`[MoMo] Request error: ${e.message}`);
            res.status(500).json({
                success: false,
                message: 'Error connecting to MoMo',
                error: e.message
            });
        });

        // Write data
        request.write(requestBody);
        request.end();

    } catch (error) {
        console.error('Create MoMo Payment Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        });
    }
};

/**
 * Create ZaloPay Payment URL
 */
exports.createZaloPayPayment = async (req, res) => {
    try {
        const { amount, orderInfo, orderId, customerName } = req.body;

        // ZaloPay Config
        const config = {
            app_id: process.env.ZALOPAY_APP_ID,
            key1: process.env.ZALOPAY_KEY1,
            key2: process.env.ZALOPAY_KEY2,
            endpoint: "https://sb-openapi.zalopay.vn/v2/create", // Hardcoded safely or rely on env but parse it
            callback_url: process.env.ZALOPAY_CALLBACK_URL
        };

        const embed_data = {
            // redirecturl is where the user is redirected to after payment on ZaloPay gateway
            redirecturl: "http://localhost:3000/tracking"
        };

        const items = [];
        const transID = Math.floor(Math.random() * 1000000);

        // Format date YYMMDD manually
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);
        const appTransId = `${year}${month}${day}_${transID}`;

        const order = {
            app_id: config.app_id,
            app_trans_id: appTransId,
            app_user: customerName || "user123",
            app_time: Date.now(), // miliseconds
            item: JSON.stringify(items),
            embed_data: JSON.stringify(embed_data),
            amount: amount,
            description: orderInfo || `Thanh toan don hang #${transID}`,
            bank_code: "",
            callback_url: config.callback_url
        };

        // app_id +”|”+ app_trans_id +”|”+ app_user +”|”+ amount +”|”+ app_time +”|”+ embed_data +”|”+ item
        const data = config.app_id + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;

        const crypto = require('crypto');
        order.mac = crypto.createHmac('sha256', config.key1)
            .update(data)
            .digest('hex');

        console.log("[ZaloPay] Creating order:", order);

        // Use standard https instead of axios
        const https = require('https');
        const querystring = require('querystring');

        // Stringify the data for application/x-www-form-urlencoded
        const postData = querystring.stringify(order);

        const options = {
            hostname: 'sb-openapi.zalopay.vn', // Extract hostname from endpoint
            port: 443,
            path: '/v2/create',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const request = https.request(options, (response) => {
            let data = '';
            response.setEncoding('utf8');

            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    console.log("[ZaloPay] Response:", result);

                    if (result.return_code === 1) {
                        res.status(200).json({
                            success: true,
                            payUrl: result.order_url,
                            orderId: orderId,
                            zaloTransId: order.app_trans_id,
                            message: 'Successfully created ZaloPay payment'
                        });
                    } else {
                        res.status(400).json({
                            success: false,
                            message: result.return_message || 'ZaloPay Error',
                            return_code: result.return_code,
                            sub_return_message: result.sub_return_message
                        });
                    }
                } catch (e) {
                    console.error("[ZaloPay] Parse Error. Data:", data);
                    res.status(500).json({
                        success: false,
                        message: 'Error parsing ZaloPay response',
                        error: e.message
                    });
                }
            });
        });

        request.on('error', (e) => {
            console.error("[ZaloPay] Request Error:", e.message);
            res.status(500).json({
                success: false,
                message: 'Error connecting to ZaloPay',
                error: e.message
            });
        });

        // Write data to request body
        request.write(postData);
        request.end();

    } catch (error) {
        console.error('Create ZaloPay Payment Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        });
    }
};

/**
 * Handle ZaloPay Callback
 */
exports.zaloPayCallback = async (req, res) => {
    let result = {};
    try {
        let dataStr = req.body.data;
        let reqMac = req.body.mac;
        const config = {
            key2: process.env.ZALOPAY_KEY2
        };

        const crypto = require('crypto');
        let mac = crypto.createHmac('sha256', config.key2)
            .update(dataStr)
            .digest('hex');

        // Check mac
        if (reqMac !== mac) {
            // invalid callback
            result.return_code = -1;
            result.return_message = "mac not equal";
        } else {
            // payment success
            // update order status here
            let dataJson = JSON.parse(dataStr); // removed config.key2 arg which was wrong
            console.log("[ZaloPay Callback] Success:", dataJson);

            // Here you would find the order by zaloTransId or parse description to find internal orderId
            // and update status to 'Paid'

            result.return_code = 1;
            result.return_message = "success";
        }
    } catch (ex) {
        result.return_code = 0; // ZaloPay server will retry
        result.return_message = ex.message;
        console.error("[ZaloPay Callback] Error:", ex.message);
    }
    res.json(result);
};
