const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/tokenManager');
const gamesController = require('../controllers/games/index');

//------------ /games/save POST method
router.post('/save', authenticateToken, gamesController.saveGame);

//------------- /games/ GET method
router.get('/', gamesController.getAllResults);

module.exports = router;