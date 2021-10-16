const signIn = require("./public/sign-in");
const signUp = require("./public/sign-up");
const getPlayer = require("./public/getPlayer");
const getAllPlayers = require("./public/getAllPlayers");
const updateRecords = require("./internal/updateRecords");
const isAnAdmin = require("./private/isAnAdmin");
const getMe = require("./private/getMe");
const getMyCredentials = require('./private/getMyCredentials');
const editMyCredentials = require('./private/editMyCredentials');
const changeMyPassword = require('./private/changeMyPassword');
const makeFriends = require('./internal/makeFriends');
const getMyFriends = require('./private/getMyFriends');
const isMyFriend = require('./private/isMyFriend');
const updateAvatar = require('./private/updateAvatar');

module.exports = {
    signIn,
    signUp,
    getPlayer,
    getAllPlayers,
    updateRecords,
    isAnAdmin,
    getMe,
    getMyCredentials,
    editMyCredentials,
    changeMyPassword,
    makeFriends,
    getMyFriends,
    isMyFriend,
    updateAvatar
};