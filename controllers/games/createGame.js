const GameModel = require("../../models/games");

//module.exports = async (req, res, next) => {
module.exports = async (xID, oID, next) => {
    try {
        // check data another time to make sure
        // userIDs may be changed ==> must be
        // what to do for isLive?
        const newGame = new GameModel({
            xID,
            oID,
            xScores: 0,
            oScores: 0,
            isLive: true,
        });

        await newGame.save();
        res.status(201).json({gameID: newGame._id.toString() ,msg: 'Game Record Created.'})

    } catch (err) {
        // console.log(err);
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
