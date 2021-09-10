const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    // gameType: {
    //     type: Number,
    //     default: 0 //0 => X-O 3D
    // },
    xID: {
        type: String,
        required: true,// needed?
    },
    oID: {
        type: String,
        required: true,// needed?
    },
    xScores: {
        type: Number,
        default: 0
    },
    oScores: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now()
    },
    isLive: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Games', userSchema);