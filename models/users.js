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
    }
});

module.exports = mongoose.model('User', userSchema);