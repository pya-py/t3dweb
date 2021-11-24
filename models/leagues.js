const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const leaguesSchema = new Schema({
    _mode: {
        type: Number,
        default: 0 //0 => X-O kickoutCup
    },
    _type: { // league game type
        scoreless: {
            type: Boolean,
            default: false,
            required: true
        },
        dimension: {
            type: Number,
            default: 4,
            required: true
        }
    },
    title: {
        type: String,
        required: true,
    },
    contesters: [{
        player: {
            type: Schema.Types.ObjectId,
            ref: "Users"
        }, //self like python self :)
        team: {
            type: Schema.Types.ObjectId,
            ref: "Teams",
            default: null
        },
        // .progress must be on "team" field or what?
        progress: { //state in the league
            points: {
                type: Number,
                default: 0
            },
            wins: {
                type: Number,
                default: 0
            },
            draws: {
                type: Number,
                default: 0
            },
            loses: {
                type: Number,
                default: 0
            }
        },
    }],
    created: {
        type: Date,
        default: new Date()
    },
    matches: [ // each round draws
        [
            // each round's draws
            {
                schedule: {
                    type: Date,
                    required: true
                },
                players: [{
                    // IDs of the players that have been matched
                    type: String,
                    required: true,
                    unique: true
                }]
            }
        ]
    ],
    started: {
        type: Date,
        default: null
    },
    finished: {
        type: Date,
        default: null
    },
    capacity: {
        type: Number,
        default: 20,
        required: true
    },
    prize: {
        type: Number,
        default: 50,
        required: true
    }
});

module.exports = mongoose.model("Leagues", leaguesSchema);