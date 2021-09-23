const NoticeModel = require("../../models/games");

module.exports = async (req, res, next) => {
    try {
        const { title, text, fromDate, untilDate } = req.body;
        const newNotice = new NoticeModel({
            title,
            text,
            fromDate,
            untilDate,
        });

        await newNotice.save();

        res.status(201).json({ msg: "Notice created." });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
