// File: config/seedAdmin.js

const Taikhoan = require('../models/taikhoan');
const bcrypt = require('bcryptjs');

/**
 * Seed default admin user if no admin exists
 */
const seedDefaultAdmin = async () => {
    try {
        // Check if any admin user exists
        const adminExists = await Taikhoan.findOne({ role: 'admin' });

        if (!adminExists) {
            console.log('No admin user found. Creating default admin...');

            // Create default admin
            const defaultAdmin = await Taikhoan.create({
                name: 'Administrator',
                email: 'admin@gmail.com',
                password: '123456', // Will be hashed by pre-save hook
                phoneNumber: '0000000000',
                role: 'admin',
                is_admin: 1,
                isActive: true,
                permissions: [] // Admin has all permissions by default
            });

            console.log('✅ Default admin created successfully!');
            console.log('📧 Email: admin@gmail.com');
            console.log('🔑 Password: 123456');
            console.log('⚠️  Please change the password after first login!');
        } else {
            console.log('Admin user already exists. Skipping seed.');
        }
    } catch (error) {
        console.error('❌ Error seeding default admin:', error);
    }
};

module.exports = seedDefaultAdmin;
