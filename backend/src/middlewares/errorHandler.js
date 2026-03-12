export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    if (statusCode >= 500) {
        console.error("Error:", err);
    } else {
        console.warn(`Handled ${statusCode}: ${message}`);
    }

    res.status(statusCode).json({
        ok: false,
        message,
        ...(err.extra || {}),
        ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    });
};
