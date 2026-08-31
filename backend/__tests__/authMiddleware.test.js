import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import verifyJWT from '../middleware/authMiddleware.js';
import User from '../model/userModel.js';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');
jest.mock('../model/userModel.js');

describe('verifyJWT Middleware', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        req = {
            cookies: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
        jest.clearAllMocks();
        process.env.ACCESS_TOKEN_SECRET = 'secret';
    });

    it('should return 401 if token is not found in cookies', async () => {
        await verifyJWT(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Token not found, unauthorised access',
        });
        expect(next).not.toHaveBeenCalled();
    });

    it('should populate req.userId and call next if token is valid', async () => {
        req.cookies.accessToken = 'validToken';
        jwt.verify.mockReturnValue({ id: 'mockUserId', tokenVersion: 0 });
        User.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue({ tokenVersion: 0 }),
        });

        await verifyJWT(req, res, next);

        expect(jwt.verify).toHaveBeenCalledWith('validToken', 'secret');
        expect(req.userId).toBe('mockUserId');
        expect(next).toHaveBeenCalled();
    });

    it('should return 401 if token verification throws an error', async () => {
        req.cookies.accessToken = 'invalidToken';
        jwt.verify.mockImplementation(() => {
            throw new Error('invalid signature');
        });

        await verifyJWT(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Unauthorised, invalid or expired token',
        });
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if user is not found', async () => {
        req.cookies.accessToken = 'validToken';
        jwt.verify.mockReturnValue({ id: 'mockUserId', tokenVersion: 0 });
        User.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(null),
        });

        await verifyJWT(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
        expect(next).not.toHaveBeenCalled();
    });
});
