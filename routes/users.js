const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const userController = require("../controllers/users");
const { authenticateToken } = require("../middlewares/tokenManager");

// create config file ... a single file for all configs*-************************
const UserRequirements = {
    FullnameLength: { min: 6 },
    PasswordLength: { min: 6, max: 15 },
    StudenIDLength: { min: 8, max: 8}
};

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
            .isLength(UserRequirements.StudenIDLength)
            .withMessage("StudentID is not valid."),
        /*.custom((value, { req }) => {
                **********this checks for user existence but doesnt send proper error ? wha=y?
                return UserModel.findOne({ studentID: value }).then((user) => {
                    if (user) {
                        return Promise.reject("StudentID already exist");
                    }
                });
            }),*/

        body("email")
            .isEmail()
            .normalizeEmail()
            .withMessage("Email is not valid."),
        body("fullname")
            .trim()
            .isLength(UserRequirements.FullnameLength)
            // .not()
            // .isEmpty()
            .withMessage("fullname is required.")
            .custom((value, { req }) => {
                // just accept persian chars
                for (let i = 0; i < value.length; i++) {
                    if (
                        value.charAt(i) !== " " &&
                        (value.charAt(i) < "آ" || value.charAt(i) > "ی")
                    )
                        return Promise.reject(
                            "Only persian characters allowed"
                        );
                }
                return Promise.resolve(value); // resolve nul?
            }),
        body("password")
            .trim()
            .isLength(UserRequirements.PasswordLength)
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
            .isLength(UserRequirements.StudenIDLength)
            .withMessage("StudentID is not valid."),
        body("email")
            .isEmail()
            .normalizeEmail()
            .withMessage("Email is not valid."),
        body("fullname")
            .trim()
            .isLength(UserRequirements.FullnameLength)
            .withMessage("fullname is required.")
            .custom((value, { req }) => {
                // just accept persian chars
                for (let i = 0; i < value.length; i++) {
                    if (
                        value.charAt(i) !== " " &&
                        (value.charAt(i) < "آ" || value.charAt(i) > "ی")
                    )
                        return Promise.reject(
                            "Only persian characters allowed"
                        );
                }
                return Promise.resolve(value); // resolve nul?
            }),
        body("password")
            .trim()
            .not()
            .isEmpty()
            .withMessage("password is required."),
    ],
    userController.editMyCredentials
);

router.put(
    "/credentials/password",
    authenticateToken,
    [
        body("studentID")
            .isNumeric() //check for other conditions for a student id
            .isLength(UserRequirements.StudenIDLength)
            .withMessage("StudentID is not valid."),
        body("password")
            .trim()
            .not()
            .isEmpty()
            .withMessage("password is required."),
        body("newPassword")
            .trim()
            .isLength(UserRequirements.PasswordLength)
            .not()
            .isEmpty()
            .withMessage("password is required."),
    ],
    userController.changeMyPassword
);
module.exports = router;
