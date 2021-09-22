const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    gameType: {
        type: Number,
        default: 4 //4 => X-O 3D 4*4*4
    },
    xID: {
        type: String,
        required: true,// needed?
    },
    oID: {
        type: String,
        required: true,// needed?
    },
    xScore: {
        type: Number,
        default: 0
    },
    oScore: {
        type: Number,
        default: 0
    },

    date: {
        type: Date,
        default: Date.now()
    },
    
    isLive: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('Games', userSchema);