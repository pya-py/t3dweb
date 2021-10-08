const express = require('express');
const { Routes } = require('../configs');
const router = express.Router();
const chatsController = require('../controllers/chats');
const { authenticateToken } = require("../middlewares/tokenManager");

//------------- /chat/single/:playerID
router.get(`/${Routes.SingleChat}/:friendID`, authenticateToken, chatsController.getOurChat);

//------------- /chat/single/:playerID
router.get(`/${Routes.Interactions}`, authenticateToken, chatsController.getMyInteractions);
module.exports = router;