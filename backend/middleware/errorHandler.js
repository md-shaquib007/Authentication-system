const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    console.error(err);

    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({ message: 'Origin not allowed' });
    }

    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
    });
};

export default errorHandler;
