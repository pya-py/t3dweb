const express = require('express');
const { Routes } = require('../configs');
const router = express.Router();
const gamesController = require('../controllers/games');
const { authenticateToken } = require("../middlewares/tokenManager");

//------------- /games/ GET method
router.get('/', gamesController.getAllGames);

//------------- /games/mine -> get my games only
router.get(`/${Routes.Mine}`, authenticateToken, gamesController.getMyGames);

module.exports = router;