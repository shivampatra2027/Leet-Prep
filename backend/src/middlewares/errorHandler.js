export const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    if (err?.name === "MulterError" && err?.code === "LIMIT_FILE_SIZE") {
        statusCode = 413;
        message = "Uploaded file is too large. Max size is 5MB.";
    }

    if (statusCode >= 500) {
        console.error("Error:", err);
    } else {
        console.warn(Handled : );
    }

    res.status(statusCode).json({
        ok: false,
        message,
        ...(err.extra || {}),
        ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    });
};