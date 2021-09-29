const GameModel = require("../../models/games");

module.exports = async (req, res, next) => {
    try {
        const allGames = (
            await GameModel.find().populate("playerX").populate("playerO")
        ).map((game) => {
            return {
                gameID: game._id.toString(),
                gameType: game.gameType,
                xName: game.playerX.fullname,
                oName: game.playerO.fullname,
                xScore: game.xScore,
                oScore: game.oScore,
                isLive: game.isLive,
            };
        });

        res.status(200).json({ allGames });
    } catch (err) {
        // console.log(err);
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};