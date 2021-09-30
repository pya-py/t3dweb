const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const gameSchema = new Schema({
    Type: {
        type: Number,
        default: 4, //4 => X-O 3D 4*4*4
    },

    players: [{
        self: { type: Schema.Types.ObjectId, ref: "Users" }, //self like python self :)
        score: { type: Number, default: 0 },
    }],

    date: {
        type: Date,
        default: Date.now(),
    },

    isLive: {
        type: Boolean,
        default: true,
    },
});

module.exports = mongoose.model("Games", gameSchema);