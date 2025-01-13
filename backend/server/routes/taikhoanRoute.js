const express = require('express');
const router = express.Router();
const accountController = require('../controllers/taikhoanController');

router.get('/api/getallaccount', accountController.getAllAccount);
router.get('/api/searchtk/:searchTerm', accountController.searchAccountByName);
module.exports = router;