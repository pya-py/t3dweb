const express = require('express');
const router = express.Router();
const chatsController = require('../controllers/chats');
const { authenticateToken } = require("../middlewares/tokenManager");

//------------- /games/:playerID
router.get('/:friendID', authenticateToken, chatsController.getOurChat);

module.exports = router;