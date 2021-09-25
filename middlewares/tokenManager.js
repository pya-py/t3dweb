const jwt = require('jsonwebtoken');

const secret = 'uX7001aYpeKbh666oK';

const generateToken = async thisUser => {
    return jwt.sign({
            user: {
                id: thisUser._id.toString(),
                admin: thisUser.isAdmin
            }
        },
        secret, {
            expiresIn: "1h" // i think its not right :|
        }
    );
}

const authenticateToken = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        const error = new Error('Not authenticated.');
        error.statusCode = 401;
        throw error;
    }
    const token = authHeader.split(' ')[1];
    let decodedToken = undefined;
    try {
        decodedToken = jwt.verify(token, secret);
    } catch (err) {
        err.statusCode = 500;
        throw err;
    }
    if (!decodedToken) {
        const error = new Error('Not authenticated.');
        error.statusCode = 401;
        throw error;
    }
    //add user to request then use it in adminAuthenticate
    req.CurrentUser = {id: decodedToken.user.id, admin: decodedToken.user.admin};
    next();
};

module.exports = {
    generateToken,
    authenticateToken
};