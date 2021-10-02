const express = require('express');
const router = express.Router();
const gamesController = require('../controllers/games');
const { authenticateToken } = require("../middlewares/tokenManager");

//------------- /games/ GET method
router.get('/', gamesController.getAllGames);

//------------- /games/:playerID
router.get('/mine', authenticateToken, gamesController.getMyGames);

module.exports = router;