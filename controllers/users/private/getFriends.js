const UserModel = require("../../../models/users");

module.exports = async (req, res, next) => {
    try {
        const userID = req.CurrentUser.id;
        const user = await UserModel.findById(userID).populate("friends");
        const friends = user.friends.map((friend) => {
            return {
                fullname: friend.fullname,
                records: friend.records,
            };
        });
        res.status(200).json({ friends });
    } catch (err) {
        // console.log(err);
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
