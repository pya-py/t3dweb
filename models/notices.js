const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const noticeSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true
    },
    fromDate: {
        type: Date,
        required: true,
        default: Date.now()
    },
    untilDate: {
        type: Date,
        default: undefined
    }
});

module.exports = mongoose.model('Notices', noticeSchema);