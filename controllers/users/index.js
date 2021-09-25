const signIn = require("./sign-in");
const signUp = require("./sign-up");
const getPlayer = require("./getPlayer");
const getAllPlayers = require("./getAllPlayers");
const updateRecords = require("./updateRecords");
const isAnAdmin = require("./isAnAdmin");
const getMyCredentials = require('./private/getMyCredentials');
const editMyCredentials = require('./private/editMyCredentials');
module.exports = {
    signIn,
    signUp,
    getPlayer,
    getAllPlayers,
    updateRecords,
    isAnAdmin,
    getMyCredentials,
    editMyCredentials
};
