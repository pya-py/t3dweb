const GameModel = require("../../models/games");

module.exports = async(gameID, xID, oID, xScore, oScore, isLive) => {
    try {
        console.log(gameID);
        const gameFound = await GameModel.findById(gameID);
        if (!gameFound) {
            const error = new Error("No game with this id has been found");
            error.statusCode = 404;
            throw error;
        }

        // update game
        // verification step:
        // 1. gameID verification
        // 2. xID && oID verif
        // use foreach, but first check if foreach paraneter is byRef pr byVal
        if (
            xID.toString() === gameFound.players[0].self.toString() && //its not populated => so .self is actually the id
            oID.toString() === gameFound.players[1].self.toString() && //check player IDs are true- otherwise request is unauthorized
            gameFound.isLive // when isLive is set to false means game ended and there is no updating accepted
        ) {
            gameFound.players[0].score = xScore;
            gameFound.players[1].score = oScore;
            gameFound.isLive = isLive;
        } else {
            const error = new Error("Unauthorized request");
            error.statusCode = 403; //means forbidden:
            // use another code?
            throw error;
        }
        await gameFound.save();
        // console.log(gameFound);
        // res.status(200).json({ message: "game result updated." });
    } catch (err) {
        console.log(err);
        //manage exeptions better
    }
};