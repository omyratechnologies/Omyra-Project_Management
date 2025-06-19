export const successResponse = (res, message, data, statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};
export const errorResponse = (res, message, error, statusCode = 400) => {
    return res.status(statusCode).json({
        success: false,
        message,
        error
    });
};
export const validationErrorResponse = (res, errors) => {
    return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: errors
    });
};
