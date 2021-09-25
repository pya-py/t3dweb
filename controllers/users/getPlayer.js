const UserModel = require('../../models/users');
// get user public info == player records
module.exports = async(req, res, next) => {
    const userID = req.params.userID;
    try {
        const userFound = await UserModel.findById(userID);
        if (!userFound) {
            const error = new Error('No user has been found');
            error.statusCode = 404;
            throw error;
        }
        const player = {
            userID: userFound._id.toString(),
            fullname: userFound.fullname,
            records: userFound.records,
            isAdmin: userFound.isAdmin
        }

        res.status(200).json({ player });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};