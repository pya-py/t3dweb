const express = require('express');
const router = express.Router();
const noticesController = require('../controllers/notices');
const { authenticateToken } = require('../middlewares/tokenManager');

//------------- /notices/ GET method
router.get('/', noticesController.getNotices);

//------------- /notices/ POST method
router.post('/', authenticateToken, noticesController.createNotice);

module.exports = router;