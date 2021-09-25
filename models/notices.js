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
    startDate: {
        type: Date,
        required: true,
        default: new Date()
    },
    endDate: {
        type: Date,
        required: true,
        default: new Date()
    }
});

module.exports = mongoose.model('Notices', noticeSchema);