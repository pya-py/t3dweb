const express = require('express');
const { Routes } = require('../configs');
const router = express.Router();
const gamesController = require('../controllers/games');
const authenticate = require("../middlewares/authenticate");

//------------- /games/ GET method
router.get('/', gamesController.getAllGames);

//------------- /games/mine -> get my games only
router.get(`/${Routes.Mine}`, authenticate.token, gamesController.getMyGames);

//------------- /games/leagues
router.get(`/${Routes.Leagues}`, authenticate.token, gamesController.leagues.fetch);

//------------ POST Methods:
//------------ POST /games/:leagueID -> join a league
router.get(`/${Routes.Leagues}/${Routes.LeaguesList}/:leagueID`, authenticate.token, gamesController.leagues.load);
router.post(`/${Routes.Leagues}/${Routes.LeaguesList}/:leagueID`, authenticate.token, gamesController.leagues.join);
router.post(`/${Routes.Leagues}/${Routes.NewLeague}`, authenticate.token, authenticate.admin, authenticate.password, gamesController.leagues.create);
module.exports = router;