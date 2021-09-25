const express = require("express");
const router = express.Router();
const noticesController = require("../controllers/notices");
const { authenticateToken } = require("../middlewares/tokenManager");
const { body } = require("express-validator");
const { authenticateAdmin } = require("../middlewares/authenticateAdmin");

// create config file ... a single file for all configs*-************************
const NoticeConfigs = {
    TitleLength: { min: 3, max: 20 },
    TextLength: { min: 5, max: 100 },
};
//------------- /notices/ GET method
router.get("/", noticesController.getShortNotices);
router.get(
    "/manage",
    authenticateToken,
    authenticateAdmin,
    noticesController.getAdvancedNotices
);

//------------- /notices/ POST method
router.post(
    "/manage",
    authenticateToken,
    authenticateAdmin,
    [
        body("title")
            .isString()
            .trim()
            .isLength(NoticeConfigs.TitleLength)
            .withMessage("title is not valid."),
        body("text").isString().trim().isLength(NoticeConfigs.TextLength),
        body("startDate").isDate().not().isEmpty(),
        body("endDate").isDate().not().isEmpty(),
    ],
    noticesController.createNotice
);

//-------------- /notices/:_id
router.put(
    "/manage/:noticeID",
    authenticateToken,
    authenticateAdmin,
    [
        // how to check -id => is it needed seriously? :|
        body("title")
            .isString()
            .trim()
            .isLength(NoticeConfigs.TitleLength)
            .withMessage("title is not valid."),
        body("text").isString().trim().isLength(NoticeConfigs.TextLength),
        body("startDate").not().isEmpty(),
        body("endDate").not().isEmpty(),
    ],
    noticesController.editNotice
);
module.exports = router;
