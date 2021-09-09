const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const userModel = require('../models/user');
const userController = require('../controllers/user');
const { authenticateToken } = require('../middlewares/tokenManager');

//──── GET Http Methods ─────────────────────────────────────────────────────────────────
router.get('/:userID', userController.getPlayer);

router.get('/', userController.getAllPlayers);

//──── POST Http Methods ─────────────────────────────────────────────────────────────────
//POST /users/signup
router.post(
    '/signup', [
        body('studentID')
        .isNumeric() //check for other conditions for a tudent id
        .withMessage('StudentID is not valid.')
        .custom((value, { req }) => {
            return userModel.findOne({ studentID: value }).then(user => {
                if (user) {
                    return Promise.reject('StudentID already exist');
                }
            });
        }),
        body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email is not valid.')
        .custom((value, { req }) => {
            return userModel.findOne({ email: value }).then(user => {
                if (user) {
                    return Promise.reject('Email address already exist');
                }
            });
        }),
        body('fullname')
        .trim()
        .isLength({ min: 6 })
        .not()
        .isEmpty()
        .withMessage('fullname is required.'),
        body('password')
        .trim()
        .isLength({ min: 6, max: 15 })
        .not()
        .isEmpty()
        .withMessage('password is required.')
    ],
    userController.signUp
);

// POST /users/signin
router.post(
    '/signin', [
        /*body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email is not valid.')
        .not()
        .isEmpty(),*/
        body('studentID')
        .isNumeric()
        .withMessage('StudentID is not valid.')
        .not()
        .isEmpty(),
        body('password')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Password is required.')
    ],
    userController.signIn
);
//──── PUT Http Methods ─────────────────────────────────────────────────────────────────
// PUT /users/:userID ==> for players record update
router.put('/:userID', authenticateToken ,userController.updateRecords);

module.exports = router;