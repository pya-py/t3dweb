const NoticeModel = require("../../models/notices");

module.exports = async (req, res, next) => {
    try {
        const noticeID = req.params.noticeID;
        const { title, text } = req.body;
        let startDate = new Date(req.body.startDate), endDate = new Date(req.body.endDate);
        //************ */
        //COMPLETELY CHECK NOTICE IN CLIENT AND SERVER
        const errors = validationResult(req);
        if (!errors.isEmpty()) { // is it needed to check input ormat in sign in?
            const error = new Error("Payload validation failed.");
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }
        
        const noticeFound = await NoticeModel.findById(noticeID);
        if (!noticeFound) {
            const error = new Error('No notice has been found...wrong id');
            error.statusCode = 404;
            throw error;
        }
        if (startDate > endDate) {
            const error = new Error("Notice start date must be before its end date.");
            error.statusCode = 422;
            throw error;
        }
        //update values:
        noticeFound.title = title;
        noticeFound.text = text;
        noticeFound.startDate = new Date(startDate);
        noticeFound.endDate = new Date(endDate);
        await noticeFound.save();

        res.status(200).json({ msg: "Notice editted successfully." });
    } catch (err) {
        // console.log(err);
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
