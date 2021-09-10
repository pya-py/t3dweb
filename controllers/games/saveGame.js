const GameModel = require("../../models/games");

module.exports = async (req, res, next) => {
    try {
        const { xID, oID, xScores, oScores, isLive } = req.body;

        // check data another time to make sure
        // userIDs may be changed ==> must be
        // what to do for isLive?
        const newGame = new GameModel({
            xID,
            oID,
            xScores,
            oScores,
            isLive,
        });

        await newGame.save();
        res.status(201).json({msg: 'Game Result Saved.'})

    } catch (err) {
        // console.log(err);
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
