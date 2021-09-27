const GameModel = require("../../models/games");
const UserModel = require("../../models/users");

const getPlayerNames = async (xID, oID) => {
    let X = await UserModel.findById(xID);
    let O = await UserModel.findById(oID);
    if (!X) X = { fullname: "***ناشناس***" };
    if (!O) O = { fullname: "***ناشناس***" };
    return { X, O };
};
module.exports = async (req, res, next) => {
    try {
        const playerGames = [];
        const allGames = await GameModel.find();
        for (let game of allGames) {
            const { X, O } = await getPlayerNames(game.xID, game.oID);
            playerGames.push({
                gameID: game._id.toString(),
                xName: X.fullname,
                oName: O.fullname,
                xScore: game.xScore,
                oScore: game.oScore,
                isLive: game.isLive,
            });
        }
        res.status(200).json({ playerGames });
    } catch (err) {
        // console.log(err);
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};