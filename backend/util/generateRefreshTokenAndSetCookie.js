import jwt from 'jsonwebtoken';

export const generateRefreshTokenAndSetCookie = (res, userId) => {
    try {
        const refreshToken = jwt.sign(
            { id: userId },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
        );

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return refreshToken;
    } catch (error) {
        throw new Error(
            'Error in generating refresh token and seeting in cookie',
            error
        );
    }
};
