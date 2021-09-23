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
        

        // to fucked up solution i think!!!!************
        const gameResults = [];
        const allGames = await GameModel.find();
        for (let game of allGames) {
            const { X, O } = await getPlayerNames(game.xID, game.oID);
            gameResults.push({
                gameID: game._id.toString(),
                gameType: game.gameType,
                xName: X.fullname,
                oName: O.fullname,
                xScore: game.xScore,
                oScore: game.oScore,
                isLive: game.isLive,
            });
        }
        res.status(200).json({ gameResults });
    } catch (err) {
        // console.log(err);
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
// const gameResults = (await GameModel.find()).map( (game) => {
        //     // return gameID and userID or not? is it safe?
        //     //is it true do this amount of await methods?
        //     // u can add fullname to game collection but then the name update doesnt apply
        //     // ****** do sth

        //     // if (!X || !O) {
        //     //     const error = new Error('at least one of the players not found');
        //     //     error.statusCode = 404; //****************edi this status code */
        //     //     throw error;
        //     // }

        //     // seriously edit this shit!
        //     //const {X, O} = getPlayerNames(game.xID, game.oID);
        //     X = { fullname: "***ناشناس***" };
        //     O = { fullname: "***ناشناس***" };
        //     return {
        //         gameID: game._id.toString(),
        //         xName: X.fullname,
        //         oName: O.fullname,
        //         xScores: game.xScores,
        //         oScores: game.oScores,
        //         isLive: game.isLive,
        //     };
        // });