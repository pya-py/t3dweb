module.exports = async(req, res, next) => {
    try {
        /*const userID = req.CurrentUser.id; // i didnt use req.params
        //i think its better to use the id extracted from token (via tokenManager)
        // cause: if you use /:userID, any one can get opthers credentials with their own token and some one else's userID
        const userFound = await UserModel.findById(userID);

        if (!userID || !userFound) {
            const error = new Error("No user has been found");
            error.statusCode = 404;
            throw error;
        }
        userFound.avatar = req.file.filename;
        await userFound.save();*/
        res.status(200).json({ msg: 'your avatar uploaded successfully' });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};