const UserModel = require("../../../models/users");

module.exports = async(req, res, next) => {
    try {
        const targetID = req.params.targetID;
        const userID = req.CurrentUser.id;
        const me = await UserModel.findById(userID);
        const isFriend = me.friends.length && Boolean(me.friends.filter((friend) => targetID.toString() === friend.toString()).length);
        res.status(200).json({ isFriend });
    } catch (err) {
        // console.log(err);
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};