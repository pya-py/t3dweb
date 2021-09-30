const GAME_STATUS = { WIN: 3, DRAW: 1, LOSE: 0 };
const UserModel = require("../../../models/users");

//folder description: Modules that are called ONLY by server and cannot be called by http requests

module.exports = async(userID, achievement) => {
    try {
        const userFound = await UserModel.findById(userID);
        if (!userFound) {
            const error = new Error("One of the players wasnt found");
            error.statusCode = 404;
            throw error;
        }

        switch (achievement) {
            case GAME_STATUS.WIN:
                userFound.records.wins++;
                break;
            case GAME_STATUS.DRAW:
                userFound.records.draws++;
                break;
            case GAME_STATUS.LOSE:
                userFound.records.loses++;
                break;
            default:
                const error = new Error("Game result is wronge... forbidden operation!");
                error.statusCode = 403;
                throw error;
        }

        userFound.records.points += achievement;
        await userFound.save();
    } catch (err) {
        console.log(err);
        if (!error.statusCode) err.statusCode = 500;
        //next(err); good idea?
    }
};