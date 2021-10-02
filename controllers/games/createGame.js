const { request } = require("express");
const GameModel = require("../../models/games");
const mongoose = require("mongoose");
//module.exports = async (req, res, next) => {
module.exports = async(xID, oID, Type) => {
    try {
        // check data another time to make sure
        // userIDs may be changed ==> must be
        // what to do for isLive?
        if (!xID || !oID) {
            //check if ids exist in database?
            const error = new Error("Each player must be online!");
            error.statusCode = 404; //edit
            throw error;
        }

        const newGame = new GameModel({
            players: [xID, oID].map(each => { return { self: mongoose.Types.ObjectId(each), score: 0 } }),
            Type,
            isLive: true,
        });

        await newGame.save();
        return { gameID: newGame._id.toString() };
    } catch (err) {
        console.log(err);
        //manage exeptions better
        return null;
    }
};