import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import verifyJWT from '../middleware/authMiddleware.js';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

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
    });

    it('should return 401 if token is not found in cookies', () => {
        verifyJWT(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Token not found , Unauthorised access',
        });
        expect(next).not.toHaveBeenCalled();
    });

    it('should populate req.userId and call next if token is valid', () => {
        req.cookies.accessToken = 'validToken';
        jwt.verify.mockReturnValue({ id: 'mockUserId' });
        process.env.ACCESS_TOKEN_SECRET = 'secret';

        verifyJWT(req, res, next);

        expect(jwt.verify).toHaveBeenCalledWith('validToken', 'secret');
        expect(req.userId).toBe('mockUserId');
        expect(next).toHaveBeenCalled();
    });

    it('should return 401 if token verification throws an error', () => {
        req.cookies.accessToken = 'invalidToken';
        jwt.verify.mockImplementation(() => {
            throw new Error('invalid signature');
        });

        verifyJWT(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Unauthorised , Invalid or expired token',
        });
        expect(next).not.toHaveBeenCalled();
    });
});
