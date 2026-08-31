import jwt from 'jsonwebtoken';

const optionalAuth = (req, res, next) => {
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    if (accessToken) {
        try {
            const decoded = jwt.verify(
                accessToken,
                process.env.ACCESS_TOKEN_SECRET
            );
            req.userId = decoded.id;
            return next();
        } catch {
            // fall through to refresh token
        }
    }

    if (refreshToken) {
        try {
            const decoded = jwt.verify(
                refreshToken,
                process.env.REFRESH_TOKEN_SECRET
            );
            req.userId = decoded.id;
        } catch {
            // ignore invalid tokens
        }
    }

    next();
};

export default optionalAuth;
