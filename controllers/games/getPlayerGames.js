const GameModel = require("../../models/games");

module.exports = async (req, res, next) => {
    const userID = req.CurrentUser.id;
    try {
        // if code below didnt work => use two seperate .find 
        // is it needed to CONVERT userID to ObjectID?????
        const playerGames = (
            await GameModel.find({ //edit this part
                $or: [{ playerX: userID }, { playerO: userID }],
            })
                .populate("playerX")
                .populate("playerO")
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

        res.status(200).json({ playerGames });
    } catch (err) {
        // console.log(err);
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
