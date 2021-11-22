const saveGame = require("./saveGame");
const getAllGames = require("./getAllGames");
const createGame = require("./createGame");
const getMyGames = require('./getMyGames');
const leagues = require('./leagues');

module.exports = {
    createGame,
    saveGame,
    getAllGames,
    getMyGames,
    leagues
};