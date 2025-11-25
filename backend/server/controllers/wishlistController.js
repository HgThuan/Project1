const Wishlist = require('../models/wishlist');
const SanPham = require('../models/sanpham');

exports.toggleWishlist = async (req, res) => {
    try {
        const { userId, productId } = req.body;

        if (!userId || !productId) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin userId hoặc productId' });
        }

        const existingItem = await Wishlist.findOne({ user_id: userId, product_id: productId });

        if (existingItem) {
            // Remove if exists
            await Wishlist.findByIdAndDelete(existingItem._id);
            return res.status(200).json({ success: true, message: 'Đã xóa khỏi danh sách yêu thích', action: 'removed' });
        } else {
            // Add if not exists
            const newItem = new Wishlist({
                user_id: userId,
                product_id: productId
            });
            await newItem.save();
            return res.status(200).json({ success: true, message: 'Đã thêm vào danh sách yêu thích', action: 'added' });
        }
    } catch (error) {
        console.error('Error toggling wishlist:', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

exports.getWishlist = async (req, res) => {
    try {
        const { userId } = req.params;

        // Find wishlist items
        const wishlistItems = await Wishlist.find({ user_id: userId });

        // Manually populate products because product_id is a String (ma_san_pham), not ObjectId
        // If SanPham used ObjectId, we could use .populate('product_id')
        const productIds = wishlistItems.map(item => item.product_id);
        const products = await SanPham.find({ ma_san_pham: { $in: productIds } });

        // Map products back to wishlist items to preserve order or add metadata if needed
        const result = products.map(product => ({
            _id: wishlistItems.find(w => w.product_id === product.ma_san_pham)?._id, // Wishlist Item ID
            product: product
        }));

        res.status(200).json({ success: true, wishlist: result });
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

exports.removeFromWishlist = async (req, res) => {
    try {
        const { id } = req.params; // Wishlist Item ID
        await Wishlist.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Đã xóa sản phẩm' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};
