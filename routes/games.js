const express = require('express');
const { Routes } = require('../configs');
const router = express.Router();
const gamesController = require('../controllers/games');
const { authenticateAdmin } = require('../middlewares/authenticateAdmin');
const { authenticateToken } = require("../middlewares/tokenManager");

//------------- /games/ GET method
router.get('/', gamesController.getAllGames);

//------------- /games/mine -> get my games only
router.get(`/${Routes.Mine}`, authenticateToken, gamesController.getMyGames);

//------------- /games/leagues
router.get(`/${Routes.Leagues}`, authenticateToken, gamesController.leagues.fetch);

//------------ POST Methods:
//------------ POST /games/:leagueID -> join a league
router.get(`/${Routes.Leagues}/${Routes.LeaguesList}/:leagueID`, authenticateToken, gamesController.leagues.load);
router.post(`/${Routes.Leagues}/${Routes.LeaguesList}/:leagueID`, authenticateToken, gamesController.leagues.join);
router.post(`/${Routes.Leagues}/${Routes.NewLeague}`, authenticateToken, authenticateAdmin, gamesController.leagues.create);
module.exports = router;