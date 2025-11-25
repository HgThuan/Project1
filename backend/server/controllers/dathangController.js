const DatHang = require('../models/dathang');
const CTDH = require('../models/ctdh');
const SanPham = require('../models/sanpham');
const invoiceController = require('./invoiceController');

const generateOrderId = () => {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `DH${year}${month}${day}${random}`;
};

exports.addOrder = async (req, res) => {
    try {
        const {
            ma_khach_hang,
            tong_tien,
            ten_khach,
            dia_chi,
            sdt,
            ghi_chu,
            chi_tiet_don_hang
        } = req.body;

        const ma_don_hang = generateOrderId();

        // 1. Create Order
        const newOrder = new DatHang({
            ma_don_hang,
            ma_khach_hang,
            tong_tien,
            ten_khach,
            dia_chi,
            sdt,
            ghi_chu,
            trang_thai: 1 // Chờ xác nhận
        });

        await newOrder.save();

        // 2. Create Order Details
        if (chi_tiet_don_hang && chi_tiet_don_hang.length > 0) {
            const orderDetails = chi_tiet_don_hang.map(item => ({
                ma_don_hang,
                ma_san_pham: item.ma_san_pham,
                ten_san_pham: item.ten_san_pham,
                so_luong: item.so_luong,
                gia: item.gia,
                mau_sac: item.mau_sac,
                kich_co: item.kich_co || item.size, // Handle both field names
                anh_sanpham: item.anh_sanpham
            }));

            await CTDH.model.insertMany(orderDetails);

            // 3. Update product quantity and sold count (Optional but recommended)
            for (const item of chi_tiet_don_hang) {
                await SanPham.findOneAndUpdate(
                    { ma_san_pham: item.ma_san_pham },
                    {
                        $inc: {
                            soluong: -item.so_luong,
                            so_luong_mua: item.so_luong
                        }
                    }
                );
            }
        }

        res.status(200).json({
            success: true,
            message: 'Đặt hàng thành công',
            ma_don_hang
        });

    } catch (error) {
        console.error('Error adding order:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi đặt hàng',
            error: error.message
        });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, status, startDate, endDate } = req.query;

        const query = {};

        // Search by Order ID or Customer Name
        if (search) {
            query.$or = [
                { ma_don_hang: { $regex: search, $options: 'i' } },
                { ten_khach: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by Status
        if (status) {
            query.trang_thai = parseInt(status);
        }

        // Filter by Date Range
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const totalOrders = await DatHang.countDocuments(query);
        const orders = await DatHang.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // For each order, fetch its details
        const ordersWithDetails = await Promise.all(orders.map(async (order) => {
            const details = await CTDH.model.find({ ma_don_hang: order.ma_don_hang });
            return {
                ...order.toObject(),
                orderDetails: details
            };
        }));

        res.status(200).json({
            orders: ordersWithDetails,
            totalOrders,
            totalPages: Math.ceil(totalOrders / parseInt(limit)),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error('Error fetching all orders:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách đơn hàng',
            error: error.message
        });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { ma_don_hang } = req.params;
        const { trang_thai, isAdmin } = req.body;
        const newStatus = parseInt(trang_thai);

        const order = await DatHang.findOne({ ma_don_hang });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        const currentStatus = order.trang_thai;

        // If not admin, apply restrictions
        if (!isAdmin) {
            // Validation Logic for regular users
            // 1. Prevent changing from 'Delivered' (4) or 'Cancelled' (5) to any other status
            if (currentStatus === 4 || currentStatus === 5) {
                return res.status(400).json({ success: false, message: 'Không thể thay đổi trạng thái đơn hàng đã hoàn thành hoặc đã hủy' });
            }

            // 2. Prevent changing to 'Cancelled' (5) if 'Shipping' (3) or 'Delivered' (4)
            if (newStatus === 5 && (currentStatus === 3 || currentStatus === 4)) {
                return res.status(400).json({ success: false, message: 'Không thể hủy đơn hàng đang giao hoặc đã giao' });
            }

            // 3. Prevent changing from 'Delivered' (4) to lower status
            if (currentStatus === 4 && newStatus < 4) {
                return res.status(400).json({ success: false, message: 'Không thể quay lại trạng thái trước khi đã giao hàng' });
            }
        }

        // Update logic
        const updateData = { trang_thai: newStatus };

        // 4. If status changes to 'Delivered' (4), update payment status
        if (newStatus === 4) {
            updateData.thanh_toan = 'Đã thanh toán';
        }

        const updatedOrder = await DatHang.findOneAndUpdate(
            { ma_don_hang },
            updateData,
            { new: true }
        );

        // 5. Auto-generate invoice when order is approved (status 2)
        if (newStatus === 2) {
            try {
                await invoiceController.autoGenerateInvoice(ma_don_hang);
                console.log(`Auto-generated invoice for approved order ${ma_don_hang}`);
            } catch (invoiceError) {
                console.error('Error auto-generating invoice:', invoiceError);
                // Don't fail the order update if invoice generation fails
            }
        }

        res.status(200).json({ success: true, message: 'Cập nhật trạng thái thành công', order: updatedOrder });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const { ma_don_hang } = req.params;
        const { userId } = req.query; // Security check

        const order = await DatHang.findOne({ ma_don_hang });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        // Security check: Ensure user owns the order
        if (order.ma_khach_hang !== userId) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền xem đơn hàng này' });
        }

        const details = await CTDH.model.find({ ma_don_hang });

        res.status(200).json({
            success: true,
            order: {
                ...order.toObject(),
                orderDetails: details
            }
        });
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

exports.cancelOrder = async (req, res) => {
    try {
        const { ma_don_hang } = req.params;
        const { userId } = req.body;

        const order = await DatHang.findOne({ ma_don_hang });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        if (order.ma_khach_hang !== userId) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền hủy đơn hàng này' });
        }

        if (order.trang_thai !== 1) {
            return res.status(400).json({ success: false, message: 'Chỉ có thể hủy đơn hàng đang chờ xác nhận' });
        }

        order.trang_thai = 5; // 5: Đã hủy
        await order.save();

        res.status(200).json({ success: true, message: 'Đã hủy đơn hàng thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

exports.trackOrder = async (req, res) => {
    try {
        const { ma_don_hang, sdt } = req.body;

        if (!ma_don_hang || !sdt) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập mã đơn hàng và số điện thoại' });
        }

        // Find order matching BOTH ma_don_hang and sdt
        const order = await DatHang.findOne({ ma_don_hang, sdt });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng hoặc số điện thoại không khớp' });
        }

        const details = await CTDH.model.find({ ma_don_hang });

        res.status(200).json({
            success: true,
            order: {
                ...order.toObject(),
                orderDetails: details
            }
        });
    } catch (error) {
        console.error('Error tracking order:', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        // Find all orders for this user, sorted by creation date (newest first)
        const orders = await DatHang.find({ ma_khach_hang: userId })
            .sort({ createdAt: -1 });

        // For each order, fetch its details
        const ordersWithDetails = await Promise.all(orders.map(async (order) => {
            const details = await CTDH.model.find({ ma_don_hang: order.ma_don_hang });
            return {
                ...order.toObject(),
                orderDetails: details
            };
        }));

        res.status(200).json({
            success: true,
            orders: ordersWithDetails,
            totalOrders: ordersWithDetails.length
        });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

exports.softDeleteOrder = async (req, res) => {
    try {
        const { ma_don_hang } = req.params;

        const order = await DatHang.findOne({ ma_don_hang });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        // Update status to Cancelled (5)
        order.trang_thai = 5;
        await order.save();

        res.status(200).json({
            success: true,
            message: 'Đã hủy đơn hàng thành công',
            order
        });
    } catch (error) {
        console.error('Error soft deleting order:', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

exports.approveOrderWithCustomerUpdate = async (req, res) => {
    try {
        const { ma_don_hang } = req.params;
        const { ten_khach, sdt, dia_chi, ghi_chu } = req.body;

        const order = await DatHang.findOne({ ma_don_hang });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        // Update both status and customer info
        order.trang_thai = 2; // Approved
        if (ten_khach) order.ten_khach = ten_khach;
        if (sdt) order.sdt = sdt;
        if (dia_chi) order.dia_chi = dia_chi;
        if (ghi_chu !== undefined) order.ghi_chu = ghi_chu; // Allow empty string

        await order.save();

        // Auto-generate invoice for approved order
        try {
            await invoiceController.autoGenerateInvoice(ma_don_hang);
            console.log(`Auto-generated invoice for approved order ${ma_don_hang}`);
        } catch (invoiceError) {
            console.error('Error auto-generating invoice:', invoiceError);
            // Don't fail the order approval if invoice generation fails
        }

        res.status(200).json({
            success: true,
            message: 'Đã duyệt và cập nhật thông tin đơn hàng thành công',
            order
        });
    } catch (error) {
        console.error('Error approving order with customer update:', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};
