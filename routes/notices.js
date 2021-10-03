const express = require("express");
const router = express.Router();
const noticesController = require("../controllers/notices");
const { authenticateToken } = require("../middlewares/tokenManager");
const { body } = require("express-validator");
const { authenticateAdmin } = require("../middlewares/authenticateAdmin");
const { Routes, PayloadRequirements } = require("../configs");

//------------- /notices/ GET method ( for common users)
router.get("/", noticesController.getShortNotices);

router.get(
    `/${Routes.NoticeManagement}`,
    authenticateToken,
    authenticateAdmin,
    noticesController.getAdvancedNotices
);

//------------- /notices/ POST method
router.post(
    `/${Routes.NoticeManagement}`,
    authenticateToken,
    authenticateAdmin, [
        body("title")
        .isString()
        .trim()
        .isLength(PayloadRequirements.Notices.TitleLength)
        .withMessage("title is not valid."),
        body("text").isString().trim().isLength(PayloadRequirements.Notices.TextLength),
        body("startDate").not().isEmpty(), //isDate()
        body("endDate").not().isEmpty(), //isDate()
    ],
    noticesController.createNotice
);

//-------------- /notices/manage/:_id
router.put(
    `/${Routes.NoticeManagement}/:noticeID`,
    authenticateToken,
    authenticateAdmin, [
        // how to check -id => is it needed seriously? :|
        body("title")
        .isString()
        .trim()
        .isLength(PayloadRequirements.Notices.TitleLength)
        .withMessage("title is not valid."),
        body("text").isString().trim().isLength(PayloadRequirements.Notices.TextLength),
        body("startDate").not().isEmpty(), //isDate()
        body("endDate").not().isEmpty(), //isDate()
    ],
    noticesController.editNotice
);
module.exports = router;