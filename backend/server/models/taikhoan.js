// File: models/Taikhoan.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const taikhoanSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Vui lòng nhập tên'],
        },
        email: {
            type: String,
            required: [true, 'Vui lòng nhập email'],
            unique: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Vui lòng nhập một email hợp lệ',
            ],
        },
        password: {
            type: String,
            required: [true, 'Vui lòng nhập mật khẩu'],
            minlength: 6,
        },
        phoneNumber: {
            type: String,
            required: [true, 'Vui lòng nhập số điện thoại'],
        },
        is_admin: {
            type: Number, // 0 = User, 1 = Admin
            required: true,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Mã hóa mật khẩu trước khi lưu
taikhoanSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Thêm một phương thức để so sánh mật khẩu
taikhoanSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Taikhoan = mongoose.model('Taikhoan', taikhoanSchema);

module.exports = Taikhoan;