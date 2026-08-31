import jwt from 'jsonwebtoken';
import { parseExpiryToMs } from './parseExpiryToMs.js';

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
};

export const generateAccessToken = (userId, email, tokenVersion = 0) => {
    return jwt.sign(
        { id: userId, email, tokenVersion },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '12h' }
    );
};

export const setAccessTokenCookie = (res, accessToken) => {
    const maxAge =
        parseExpiryToMs(process.env.ACCESS_TOKEN_EXPIRY || '12h') ??
        12 * 60 * 60 * 1000;

    res.cookie('accessToken', accessToken, {
        ...cookieOptions,
        maxAge,
    });
};

export const generateRefreshTokenAndSetCookie = (res, userId, tokenVersion = 0) => {
    try {
        const refreshToken = jwt.sign(
            { id: userId, tokenVersion },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
        );

        const maxAge =
            parseExpiryToMs(process.env.REFRESH_TOKEN_EXPIRY || '7d') ??
            7 * 24 * 60 * 60 * 1000;

        res.cookie('refreshToken', refreshToken, {
            ...cookieOptions,
            maxAge,
        });

        return refreshToken;
    } catch (error) {
        throw new Error(
            `Error in generating refresh token and setting cookie: ${error.message}`
        );
    }
};

export const clearAuthCookies = (res) => {
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);
};
