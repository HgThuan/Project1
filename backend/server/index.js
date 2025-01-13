const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

// Export router

const sanphamRoutes = require('../server/routes/sanphamRoute');
const danhmucRoutes = require('./routes/danhmucRoute');
const nhanvienRoutes = require('./routes/nhanvienRoute');
const khachhangRoutes = require('./routes/khachhangRoute');
const khohangRoutes = require('./routes/khohangRoute');
const donhangRoutes = require('./routes/hoadonRoute');
const hdnRoutes = require('./routes/hoadonnhapRoute');
const ctdhRoutes = require('./routes/ctdhRoutes');
const taikhoanRoutes = require('./routes/taikhoanRoute');
const dathangRoutes = require('./routes/dathangRoute');

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Sử dụng route
app.use(sanphamRoutes);
app.use(danhmucRoutes);
app.use(nhanvienRoutes);
app.use(khachhangRoutes);
app.use(khohangRoutes);
app.use(donhangRoutes);
app.use(hdnRoutes);
app.use(ctdhRoutes);
app.use(taikhoanRoutes);
app.use(dathangRoutes);




app.listen(5000, () => {
    console.log("Server is running on port 5000");
});
