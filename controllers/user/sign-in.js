const bcryptjs = require("bcryptjs");
const { validationResult } = require("express-validator");
const UserModel = require("../../models/user");
const { generateToken } = require('../../middlewares/tokenManager');

module.exports = async(req, res, next) => {
    const { studentID, password } = req.body;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) { // is it needed to check input ormat in sign in?
            const error = new Error("Validation Error.");
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }
        const userFound = await UserModel.findOne({ studentID });
        if (!userFound) {
            const error = new Error(
                "A user with this studentID could not be found"
            );
            error.statusCode = 401;
            throw error;
        }

        const isEqual = await bcryptjs.compare(password, userFound.password);

        if (!isEqual) {
            const error = new Error("Wrong password.");
            error.statusCode = 401;
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