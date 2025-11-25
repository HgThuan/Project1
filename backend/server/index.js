const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const connectDB = require('./config/db'); // Import file kết nối DB
const seedDefaultAdmin = require('./config/seedAdmin'); // Import admin seeding function
// Import file routes
dotenv.config();

const app = express();
connectDB();

// Seed default admin on server startup
seedDefaultAdmin();
// Export router

const sanphamRoutes = require('./routes/sanphamRoute');
const danhmucRoutes = require('./routes/danhmucRoute');
const nhanvienRoutes = require('./routes/nhanvienRoute');
const khachhangRoutes = require('./routes/khachhangRoute');
const donhangRoutes = require('./routes/hoadonRoute');
const ctdhRoutes = require('./routes/ctdhRoutes');
const dathangRoutes = require('./routes/dathangRoute');
const taikhoanRoutes = require('./routes/taikhoanRoute');
const authRoutes = require('./routes/authRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const statsRoutes = require('./routes/statsRoutes');
const staffRoutes = require('./routes/staffRoutes');
const auditRoutes = require('./routes/auditRoutes');
const profileRoutes = require('./routes/profileRoutes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Sử dụng route
app.use('/uploads', express.static('uploads'));
app.use('/', sanphamRoutes);
app.use(danhmucRoutes);
app.use(nhanvienRoutes);
app.use(khachhangRoutes);
app.use(donhangRoutes);

app.use(ctdhRoutes);
app.use(dathangRoutes);

app.use('/api', taikhoanRoutes);
app.use('/api/auth', authRoutes);
app.use(reviewRoutes);
app.use(cartRoutes);
app.use(wishlistRoutes);
app.use('/api', paymentRoutes);
app.use(invoiceRoutes);
app.use(statsRoutes);
app.use(staffRoutes);
app.use(auditRoutes);
app.use(profileRoutes);


app.listen(5001, () => {
    console.log("Server is running on port 5001");
});
