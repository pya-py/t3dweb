const UserModel = require('../../../models/users');
// get user public info == player records
module.exports = async(playerID) => {
    const userFound = await UserModel.findById(playerID);
    if (!userFound) {
        const error = new Error('No user has been found');
        error.statusCode = 404;
        throw error;
    }
    return {
        userID: userFound._id.toString(),
        fullname: userFound.fullname,
        records: userFound.records,
        isAdmin: userFound.isAdmin
    }
}