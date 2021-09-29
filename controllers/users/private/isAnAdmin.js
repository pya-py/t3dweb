const UserModel = require('../../../models/users');
// get user public info == player records
module.exports = async(req, res, next) => {
    //is this necessary? ( maybe yes)
    const userID = req.params.userID;
    try {
        if (userID !== req.CurrentUser.id) {
            const error = new Error('Wronge payload passed');
            error.statusCode = 400;
            throw error;
        }
        const userFound = await UserModel.findById(userID);
        if (!userFound) {
            const error = new Error('No user has been found');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({ answer: userFound.isAdmin });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};