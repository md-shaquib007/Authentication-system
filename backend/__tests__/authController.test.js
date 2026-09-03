import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { login, logout } from '../controller/authController.js';
import User from '../model/userModel.js';
import bcrypt from 'bcryptjs';
import {
    generateRefreshTokenAndSetCookie,
    generateAccessToken,
    setAccessTokenCookie,
    clearAuthCookies,
} from '../util/tokenHelpers.js';

jest.mock('../model/userModel.js');
jest.mock('bcryptjs');
jest.mock('../util/tokenHelpers.js', () => ({
    generateRefreshTokenAndSetCookie: jest.fn(),
    generateAccessToken: jest.fn(),
    setAccessTokenCookie: jest.fn(),
    clearAuthCookies: jest.fn(),
}));
jest.mock('../email/email.js', () => ({
    sendVerificationEmail: jest.fn(),
    sendWelcomeEmail: jest.fn(),
    sendPasswordSuccessEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
}));

describe('authController - login', () => {
    let req;
    let res;

    beforeEach(() => {
        req = {
            body: {
                email: 'test@example.com',
                password: 'password123',
            },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn().mockReturnThis(),
        };
        jest.clearAllMocks();
        process.env.ACCESS_TOKEN_SECRET = 'secret';
    });

    it('should return 401 if user is not found', async () => {
        User.findOne.mockResolvedValue(null);

        await login(req, res);

        expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });

    it('should return 401 if password does not match', async () => {
        const mockUser = {
            email: 'test@example.com',
            password: 'hashedpassword',
            save: jest.fn().mockResolvedValue(true),
        };
        User.findOne.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(false);

        await login(req, res);

        expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });

    it('should return 200 and set cookies if credentials are valid', async () => {
        const mockUser = {
            _id: 'userId123',
            email: 'test@example.com',
            password: 'hashedpassword',
            tokenVersion: 0,
            save: jest.fn().mockResolvedValue(true),
            toObject: jest.fn().mockReturnValue({
                _id: 'userId123',
                email: 'test@example.com',
                isVerified: true,
            }),
        };
        User.findOne.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(true);
        generateAccessToken.mockReturnValue('mockAccessToken');

        await login(req, res);

        expect(mockUser.save).toHaveBeenCalled();
        expect(generateRefreshTokenAndSetCookie).toHaveBeenCalledWith(
            res,
            'userId123',
            0
        );
        expect(setAccessTokenCookie).toHaveBeenCalledWith(res, 'mockAccessToken');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'User logged in successfully',
            user: {
                _id: 'userId123',
                email: 'test@example.com',
                isVerified: true,
            },
        });
    });
});

describe('authController - logout', () => {
    let req;
    let res;

    beforeEach(() => {
        req = {
            userId: 'userId123',
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
    });

    it('should clear cookies and return 200 on logout', async () => {
        User.findByIdAndUpdate.mockResolvedValue({});

        await logout(req, res);

        expect(User.findByIdAndUpdate).toHaveBeenCalledWith('userId123', expect.any(Object));
        expect(clearAuthCookies).toHaveBeenCalledWith(res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'User logged out successfully' });
    });
});
