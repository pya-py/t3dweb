const GameModel = require("../../models/games");

//module.exports = async (req, res, next) => {
module.exports = async (xID, oID, gameType) => {
    try {
        // check data another time to make sure
        // userIDs may be changed ==> must be
        // what to do for isLive?
        const newGame = new GameModel({
            xID,
            oID,
            gameType,
            xScore: 0,
            oScore: 0,
            isLive: true,
        });

        await newGame.save();
        return {gameID: newGame._id.toString()};
    } catch (err) {
        console.log(err);
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        // next(err);
        return null;
    }
};
