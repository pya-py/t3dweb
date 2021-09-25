const bcryptjs = require("bcryptjs");
const { validationResult } = require("express-validator");
const UserModel = require("../../models/users");
const { generateToken } = require('../../middlewares/tokenManager');

module.exports = async(req, res, next) => {
    const { studentID, password } = req.body;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) { // is it needed to check input ormat in sign in?
            const error = new Error("Payload validation failed.");
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }
        const userFound = await UserModel.findOne({ studentID });
        if (!userFound) {
            const error = new Error(
                "A user with this studentID could not be found"
            );
            error.statusCode = 403;
            throw error;
        }

        const isEqual = await bcryptjs.compare(password, userFound.password);

        if (!isEqual) { //is it ok to log if the username or password is wronge exactly?
            const error = new Error("Wrong password.");
            error.statusCode = 403;
            throw error;
        }

        const token = await generateToken(userFound);

        res.status(200).json({ token, userID: userFound._id.toString() });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};