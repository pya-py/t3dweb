const UserModel = require("../models/users");

const authenticateAdmin = async (req, res, next) => {
    // token is verified and checked with sign before
    // just decode it and check user is admin or not

    try {
        // const authHeader = req.get("Authorization");
        // // token authenticated before ... so no need to check again
        // const token = authHeader.split(" ")[1];
        // const {user} = jwt.decode(token);
        // no need to decode the token again, user.id and user.admin has been add to request in token authenticate precedure: req.userID
        const {CurrentUser} = req;

        const userFoundInDatabase = await UserModel.findById(CurrentUser.id);
        if (!userFoundInDatabase) {
            const error = new Error("No admin has been found");
            error.statusCode = 404;
            throw error;
        }
        if (!CurrentUser.admin || !userFoundInDatabase.isAdmin) {
            //check both token and database values: DOUBLE CHECK TO MAKE SURE
            const error = new Error("This user doesn't have admin previlages");
            error.statusCode = 406; // 406: not acceptable
            throw error;
        }
        next();
    } catch(err) {
        //console.log(err);
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

module.exports = { authenticateAdmin };
