const express = require("express");
const { body } = require("express-validator");
const { Routes, PayloadRequirements } = require("../configs");
const router = express.Router();
const userController = require("../controllers/users");
const { authenticateToken } = require("../middlewares/tokenManager");

//------------------------------ Public requests: (NO token required) -----------------------
//──── GET Http Methods ─────────────────────────────────────────────────────────────────
router.get(`/${Routes.Public}/:userID`, userController.getPlayer);

router.get(`/${Routes.Public}`, userController.getAllPlayers);

//──── POST Http Methods ─────────────────────────────────────────────────────────────────
//POST /users/signup
router.post(
    `/${Routes.SignUp}`, [
        body("studentID")
        .isNumeric() //check for other conditions for a student id
        .isLength(PayloadRequirements.Users.StudenIDLength)
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
        .isLength(PayloadRequirements.Users.FullnameLength)
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
        .isLength(PayloadRequirements.Users.PasswordLength)
        .not()
        .isEmpty()
        .withMessage("password is required."),
    ],
    userController.signUp
);

// POST /users/signin
router.post(
    `/${Routes.SignIn}`, [
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

//------------------------------ Private requests: (token required) -----------------------
//──── GET Http Methods ─────────────────────────────────────────────────────────────────

//----- GET is admin?
router.get(
    `/${Routes.Administrators}/:userID`,
    authenticateToken,
    userController.isAnAdmin
);

//----- GET /users/credentials/
router.get(`/${Routes.Credentials}`, authenticateToken, userController.getMyCredentials);

//----- GET /users/credentials/friends
router.get(`/${Routes.Credentials}/${Routes.Friends}`, authenticateToken, userController.getMyFriends);

//----- GET /users/credentials/friends
router.get(`/${Routes.Credentials}/${Routes.Friends}/:targetID`, authenticateToken, userController.isMyFriend);

//──── PUT Http Methods ─────────────────────────────────────────────────────────────────
// PUT /users/credentials
router.put(
    `/${Routes.Credentials}`,
    authenticateToken, [
        body("studentID")
        .isNumeric() //check for other conditions for a student id
        .isLength(PayloadRequirements.Users.StudenIDLength)
        .withMessage("StudentID is not valid."),
        body("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Email is not valid."),
        body("fullname")
        .trim()
        .isLength(PayloadRequirements.Users.FullnameLength)
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
    `/${Routes.Credentials}/${Routes.PasswordChange}`,
    authenticateToken, [
        body("studentID")
        .isNumeric() //check for other conditions for a student id
        .isLength(PayloadRequirements.Users.StudenIDLength)
        .withMessage("StudentID is not valid."),
        body("password")
        .trim()
        .not()
        .isEmpty()
        .withMessage("password is required."),
        body("newPassword")
        .trim()
        .isLength(PayloadRequirements.Users.PasswordLength)
        .not()
        .isEmpty()
        .withMessage("password is required."),
    ],
    userController.changeMyPassword
);
module.exports = router;