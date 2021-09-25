const { validationResult } = require("express-validator");
const UserModel = require("../../../models/users");
const bcryptjs = require("bcryptjs");
// const { sendEmail } = require('../utils/mailer');

module.exports = async (req, res, next) => {
    try {
        const userID = req.CurrentUser.id; //read uid from token to make sure every thing is trusted
        const { studentID, email, fullname, password } = req.body;
        const me = await UserModel.findById(userID);
        if (!userID || !me || studentID !== me.studentID) {
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

        //edit values
        //check email
        if (me.email !== email) {
            //if email is changing, check whether it's unique;
            const emailOwner = await UserModel.findOne({ email });
            if (emailOwner) {
                const error = new Error("This email belongs to another person");
                error.statusCode = 409; // already exists
                throw error;
            }
            
        }

        me.fullname = fullname;
        me.email = email;
        await me.save();

        res.status(200).json({ msg: "Your credentials updated successfully" });
        // sendEmail(
        //     user.email,
        //     user.fullname,
        //     'Signup was seccessfull.',
        //     'We glad to have you on board.'
        // )
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
