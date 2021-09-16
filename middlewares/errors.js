exports.errorHandler = (error, req, res, next) => {
    const status = error.statusCode || 500;
    const message = error.message;
    //console.log(message);
    const data = error.data;
    res.status(status).json({ message, data });
};