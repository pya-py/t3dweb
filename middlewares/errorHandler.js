exports.errorHandler = (error, req, res, next) => {
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    req.CurrentError = message; //temp: to log error in morgan
    // above code: not working! why?
    res.status(status).json({ message, data });
};