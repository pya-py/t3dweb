const jwt = require('jsonwebtoken');
const UserModel = require("../models/users");
const secret = 'uX7001aYpeKbh666oK';
const bcryptjs = require("bcryptjs");

const generateToken = async thisUser => {
    return jwt.sign({
            user: {
                id: thisUser._id.toString(),
                admin: thisUser.isAdmin
            }
        },
        secret, {
            expiresIn: "7d" // i think its not right :|
        }
    );
}

//for web socket reqs:
// define exclusive error model
// define english and persian error msgs
const tokenForWS = (recievedToken) => {
    let decodedToken = jwt.verify(recievedToken, secret);

    if (!decodedToken) {
        const error = new Error('Not authenticated.');
        error.statusCode = 465; //GoFuckYourSelfALittle Error: 465 => token not decoded and not generated by me
        throw error;
    } else if (!decodedToken.user) {
        const error = new Error('token is missing vital information... it may have been compromised');
        error.statusCode = 466; //GoFuckYourSelfCompletely Error: 466 => token decoded but its not generated by me
        throw error;
    }
    return decodedToken.user.id;
}

//for http reqs
const token = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) { //not signed in yet
        const error = new Error('Not authenticated.');
        error.statusCode = 401;
        throw error;
    }
    const recievedToken = authHeader.split(' ')[1];
    // const t0 = Date.now();
    let decodedToken = undefined;
    try {
        decodedToken = jwt.verify(recievedToken, secret);
    } catch (err) {
        err.statusCode = 420; //session expired
        throw err;
    }
    if (!decodedToken) {
        const error = new Error('Not authenticated.');
        error.statusCode = 465; //GoFuckYourSelfALittle Error: 465 => token not decoded and not generated by me
        throw error;
    }
    //add user to request then use it in adminAuthenticate
    else if (!decodedToken.user) {
        const error = new Error('token is missing vital information... it may have been compromised');
        error.statusCode = 466; //GoFuckYourSelfCompletely Error: 466 => token decoded but its not generated by me
        throw error;
    }
    // const t1 = Date.now();
    //console.log('token check time: ', (t1 - t0) / 1000, 'ms');
    req.CurrentUser = { id: decodedToken.user.id, admin: decodedToken.user.admin };

    next();
};

const admin = async(req, res, next) => {
    // token is verified and checked with sign before
    // just decode it and check user is admin or not

    try {
        // const authHeader = req.get("Authorization");
        // // token authenticated before ... so no need to check again
        // const token = authHeader.split(" ")[1];
        // const {user} = jwt.decode(token);
        // no need to decode the token again, user.id and user.admin has been add to request in token authenticate precedure: req.userID
        const { CurrentUser } = req;

        const userFoundInDatabase = await UserModel.findById(CurrentUser.id);
        if (!userFoundInDatabase) {
            const error = new Error("No admin has been found");
            error.statusCode = 404;
            throw error;
        }
        if (!CurrentUser.admin || !userFoundInDatabase.isAdmin) {
            //check both token and database values: DOUBLE CHECK TO MAKE SURE
            const error = new Error("This user doesn't have admin previlages");
            error.statusCode = 406; // 406: not acceptable | or maybe Locked: 423?
            throw error;
        }
        next();
    } catch (err) {
        //console.log(err);
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

const password = async(req, res, next) => {
    try {
        const userID = req.CurrentUser.id; //read uid from token to make sure every thing is trusted
        const { password: pass } = req.body;
        const me = await UserModel.findById(userID);
        if (!userID || !me) {
            const error = new Error(
                "User with this specific credentials can not be found!"
            );
            error.statusCode = 404; // already exists
            throw error;
        }

        const isEqual = await bcryptjs.compare(pass, me.password);
        if (!isEqual) {
            //is it ok to log if the username or password is wronge exactly?
            const error = new Error("Wrong password.");
            error.statusCode = 403;
            throw error;
        }
        next();
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}
module.exports = {
    tokenForWS,
    generateToken,
    token,
    admin,
    password
};