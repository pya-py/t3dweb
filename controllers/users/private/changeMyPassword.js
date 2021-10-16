const { validationResult } = require("express-validator");
const UserModel = require("../../../models/users");
const bcryptjs = require("bcryptjs");
const SALT_LENGTH = 11;

module.exports = async(req, res, next) => {
    try {
        const userID = req.CurrentUser.id; //read uid from token to make sure every thing is trusted
        const { password, newPassword } = req.body;
        const me = await UserModel.findById(userID);
        if (!userID || !me) {
            const error = new Error(
                "User with this specific credentials can not be found!"
            );
            error.statusCode = 404; // already exists
            throw error;
        }

        const isEqual = await bcryptjs.compare(password, me.password);
        if (!isEqual) {
            //is it ok to log if the username or password is wronge exactly?
            const error = new Error("Wrong password.");
            error.statusCode = 403;
            throw error;
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // is it needed to check input ormat in sign in?
            const error = new Error("Payload validation failed.");
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }

        //change password
        const hashedNewPassword = await bcryptjs.hash(newPassword, SALT_LENGTH);

        me.password = hashedNewPassword;

        await me.save();

        res.status(200).json({ msg: "Your password changed successfully" });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};