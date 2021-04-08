const { stack } = require("../routes/UserRoutes");
const { captureStackTrace } = require("../utils/Apperror");

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
    });
};
//this above function is the global error handler function