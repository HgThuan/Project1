const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const connectDB = require('./config/db'); // Import file kết nối DB
 // Import file routes
dotenv.config();

const app = express();
connectDB();
// Export router

const sanphamRoutes = require('./routes/sanphamRoute');
const danhmucRoutes = require('./routes/danhmucRoute');
const nhanvienRoutes = require('./routes/nhanvienRoute');
const khachhangRoutes = require('./routes/khachhangRoute');
const khohangRoutes = require('./routes/khohangRoute');
const donhangRoutes = require('./routes/hoadonRoute');
const hdnRoutes = require('./routes/hoadonnhapRoute');
const ctdhRoutes = require('./routes/ctdhRoutes');
const dathangRoutes = require('./routes/dathangRoute');
const taikhoanRoutes = require('./routes/taikhoanRoute'); 
const authRoutes = require('./routes/authRoutes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Sử dụng route
app.use('/uploads', express.static('uploads'));
app.use('/', sanphamRoutes);
app.use(danhmucRoutes);
app.use(nhanvienRoutes);
app.use(khachhangRoutes);
app.use(khohangRoutes);
app.use(donhangRoutes);
app.use(hdnRoutes);
app.use(ctdhRoutes);
app.use(dathangRoutes);

app.use('/api', taikhoanRoutes);
app.use('/api/auth', authRoutes);


app.listen(5001, () => {
    console.log("Server is running on port 5001");
});
