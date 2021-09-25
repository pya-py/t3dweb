const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const userController = require("../controllers/users");
const { authenticateToken } = require("../middlewares/tokenManager");

//──── GET Http Methods ─────────────────────────────────────────────────────────────────
router.get("/public/:userID", userController.getPlayer);

//----- GET /users/credentials/
router.get("/credentials", authenticateToken, userController.getMyCredentials);

router.get("/public", userController.getAllPlayers);
//----- GET is admin?
router.get(
    "/administrators/:userID",
    authenticateToken,
    userController.isAnAdmin
);

//──── POST Http Methods ─────────────────────────────────────────────────────────────────
//POST /users/signup
router.post(
    "/signup",
    [
        body("studentID")
            .isNumeric() //check for other conditions for a student id
            .withMessage("StudentID is not valid."),
        // .custom((value, { req }) => {
        //     //**********this checks for user existence but doesnt send proper error ? wha=y?
        //     return UserModel.findOne({ studentID: value }).then((user) => {
        //         if (user) {
        //             return Promise.reject("StudentID already exist");
        //         }
        //     });
        // }),

        body("email")
            .isEmail()
            .normalizeEmail()
            .withMessage("Email is not valid."),
        body("fullname")
            .trim()
            .isLength({ min: 6 })
            // .not()
            // .isEmpty()
            .withMessage("fullname is required."),
        body("password")
            .trim()
            .isLength({ min: 6, max: 15 })
            .not()
            .isEmpty()
            .withMessage("password is required."),
    ],
    userController.signUp
);

// POST /users/signin
router.post(
    "/signin",
    [
        body("studentID")
            .isNumeric()
            .withMessage("StudentID is not valid.")
            .not()
            .isEmpty(),
        body("password")
            .trim()
            .not()
            .isEmpty()
            .withMessage("Password is required."),
    ],
    userController.signIn
);

// PUT /users/credentials
router.put(
    "/credentials",
    authenticateToken,
    [
        body("studentID")
            .isNumeric() //check for other conditions for a student id
            .withMessage("StudentID is not valid."),
        body("email")
            .isEmail()
            .normalizeEmail()
            .withMessage("Email is not valid."),
        body("fullname")
            .trim()
            .isLength({ min: 6 })
            .withMessage("fullname is required."),
        body("password")
            .trim()
            .isLength({ min: 6, max: 15 })
            .not()
            .isEmpty()
            .withMessage("password is required."),
    ],
    userController.editMyCredentials
);
module.exports = router;
