const express = require('express');
const router = express.Router();
const gamesController = require('../controllers/games/index');

//------------- /games/ GET method
router.get('/', gamesController.getAllResults);

module.exports = router;