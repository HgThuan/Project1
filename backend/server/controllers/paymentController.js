const crypto = require('crypto');
const querystring = require('querystring');

// VNPay Configuration
const vnp_TmnCode = "G4PKQK2T";
const vnp_HashSecret = "3UYJFY7BBDDJ6BB0BNL0Y3S9QU2KB5SS";
const vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const vnp_ReturnUrl = "http://localhost:3000/order-success";

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

        // Get current date/time
        const date = new Date();
        const createDate = date.getFullYear().toString() +
            ('0' + (date.getMonth() + 1)).slice(-2) +
            ('0' + date.getDate()).slice(-2) +
            ('0' + date.getHours()).slice(-2) +
            ('0' + date.getMinutes()).slice(-2) +
            ('0' + date.getSeconds()).slice(-2);

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
        vnp_Params['vnp_Amount'] = amount * 100; // VNPay requires amount in smallest currency unit (VND * 100)
        vnp_Params['vnp_ReturnUrl'] = vnp_ReturnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;

        // Sort parameters alphabetically by key
        const sortedKeys = Object.keys(vnp_Params).sort();

        // Build sign data string (for hash calculation)
        const signDataParts = [];
        sortedKeys.forEach(key => {
            const value = vnp_Params[key];
            if (value !== null && value !== undefined && value !== '') {
                signDataParts.push(key + '=' + value);
            }
        });
        const signData = signDataParts.join('&');

        // Generate secure hash using HMAC SHA512
        const hmac = crypto.createHmac("sha512", vnp_HashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        // Add secure hash to params
        vnp_Params['vnp_SecureHash'] = signed;

        // Build final payment URL with proper encoding
        const urlParams = new URLSearchParams();
        Object.keys(vnp_Params).sort().forEach(key => {
            urlParams.append(key, vnp_Params[key]);
        });
        const paymentUrl = vnp_Url + '?' + urlParams.toString();

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

        const signData = querystring.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", vnp_HashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        if (secureHash === signed) {
            const orderId = vnp_Params['vnp_TxnRef'];
            const rspCode = vnp_Params['vnp_ResponseCode'];

            // TODO: Update order status in database based on rspCode
            // rspCode = '00' means success

            res.status(200).json({ RspCode: '00', Message: 'success' });
        } else {
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

        const signData = querystring.stringify(vnp_Params, { encode: false });
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
