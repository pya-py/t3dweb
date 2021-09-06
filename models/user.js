const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    studentID: {
        type: Number,
        required: true,
        unique: true
    },
    fullname: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    records: {
        type: Object,
        default: { points: 0, wins: 0, loses: 0, draws: 0 }
    }
});

module.exports = mongoose.model('User', userSchema);