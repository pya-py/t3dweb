const isErrorExpected = (error) => {
    return (
        error &&
        error.statusCode >= 400 && // >= : bad request
        error.statusCode <= 500 // <= 500: internal server error
    );
    // other errors are not expected
};

module.exports = {
    Successful: 200,
    CreatedSuccessfully: 201,
    BadRequest: 400,
    Unauthorized: 401,
    Forbidden: 403,
    NotFound: 404,
    MethodNotAllowed: 405,
    NotAcceptable: 406,
    Conflict: 409,
    SessionExpired: 420,
    UnprocessableEntity: 422,
    InternalServerError: 500,
    isErrorExpected,
};