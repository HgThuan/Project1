const Account = require('../../server/model/taikhoan');

exports.getAllAccount = (req, res) => {
    Account.getAll((err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.send(result);
    });
};

// Hàm mới để tìm kiếm gần đúng theo tên sản phẩm
exports.searchAccountByName = (req, res) => {
    const { searchTerm } = req.params; // Lấy search term từ URL params
    Account.searchByName(searchTerm, (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.send(result);
    });
};