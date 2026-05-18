"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;
    if (err.code === 11000) {
        statusCode = 400;
        message = 'Duplicate field value entered';
    }
    if (err.name === 'ValidationError' && err.errors) {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((val) => val.message)
            .join(', ');
    }
    if (err.name === 'CastError') {
        statusCode = 404;
        message = 'Resource not found';
    }
    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};
exports.errorHandler = errorHandler;
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};
exports.notFound = notFound;
