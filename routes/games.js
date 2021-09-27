const express = require('express');
const router = express.Router();
const gamesController = require('../controllers/games/index');

//------------- /games/ GET method
router.get('/', gamesController.getAllGames);

//------------- /games/:playerID
router.get('/', gamesController.getPlayerGames);

module.exports = router;