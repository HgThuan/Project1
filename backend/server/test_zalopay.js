const crypto = require('crypto');
const querystring = require('querystring'); // Use querystring for x-www-form-urlencoded
const https = require('https');

// Config
const config = {
    app_id: "2553",
    key1: "PcY4iZIKFCIdgZvA21hk1nmkNO4HnKLi",
    key2: "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz",
    endpoint: "https://sb-openapi.zalopay.vn/v2/create"
};

const embed_data = "{}";
const items = "[]";

// Use default system time (2026) initially to see if we get -402
const transID = Math.floor(Math.random() * 1000000);
const date = new Date(); // 2026
const year = date.getFullYear().toString().slice(-2);
const month = ('0' + (date.getMonth() + 1)).slice(-2);
const day = ('0' + date.getDate()).slice(-2);
const app_trans_id = `${year}${month}${day}_${transID}`;
const app_time = Date.now();

const order = {
    app_id: config.app_id,
    app_trans_id: app_trans_id,
    app_user: "user123",
    app_time: app_time,
    item: items,
    embed_data: embed_data,
    amount: 50000,
    description: `ZaloPay Integration Demo`,
    bank_code: "",
    callback_url: "https://pseudoaesthetically-compossible-veronika.ngrok-free.dev/api/zalopay_callback"
};

// MAC String construction
const data = config.app_id + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;

order.mac = crypto.createHmac('sha256', config.key1)
    .update(data)
    .digest('hex');

console.log("MAC data:", data);
console.log("Order:", order);

const postData = querystring.stringify(order);

const requestOptions = {
    hostname: 'sb-openapi.zalopay.vn',
    port: 443,
    path: '/v2/create',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = https.request(requestOptions, (res) => {
    let responseData = '';
    res.on('data', (chunk) => { responseData += chunk; });
    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        try {
            console.log('Response:', JSON.parse(responseData));
        } catch (e) {
            console.log('Response Raw:', responseData);
        }
    });
});

req.on('error', (e) => console.error(e));
req.write(postData);
req.end();
