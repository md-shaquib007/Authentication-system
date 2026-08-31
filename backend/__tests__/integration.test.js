import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import User from '../model/userModel.js';
import bcrypt from 'bcryptjs';

jest.mock('../model/userModel.js');
jest.mock('bcryptjs');
jest.mock('../config/dbConnect.js', () => jest.fn().mockResolvedValue(undefined));
jest.mock('../middleware/rateLimitStore.js', () => ({
    getRateLimitStore: jest.fn().mockResolvedValue({
        increment: jest.fn().mockResolvedValue(1),
    }),
}));

jest.mock('../email/email.js', () => ({
    sendVerificationEmail: jest.fn().mockResolvedValue(true),
    sendWelcomeEmail: jest.fn().mockResolvedValue(true),
    sendPasswordSuccessEmail: jest.fn().mockResolvedValue(true),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
}));

const mockUserDoc = {
    _id: 'mocked_id',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedPassword123',
    tokenVersion: 0,
    isVerified: true,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    save: jest.fn().mockResolvedValue(true),
    toObject: jest.fn().mockReturnValue({
        _id: 'mocked_id',
        username: 'testuser',
        email: 'test@example.com',
        isVerified: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
    }),
};

const createFindByIdMock = (user = mockUserDoc) => {
    const query = Promise.resolve(user);
    query.select = jest.fn().mockResolvedValue({
        tokenVersion: user.tokenVersion ?? 0,
    });
    return query;
};

const setupJwtMocks = () => {
    User.findById.mockImplementation(() => createFindByIdMock());
};

const loginAndGetAgent = async () => {
    User.findOne.mockResolvedValue(mockUserDoc);
    bcrypt.compare.mockResolvedValue(true);

    const agent = request.agent(app);
    const res = await agent.post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'Password1!',
    });

    expect(res.status).toBe(200);
    return agent;
};

describe('Auth Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.ACCESS_TOKEN_SECRET = 'test_access_secret';
        process.env.REFRESH_TOKEN_SECRET = 'test_refresh_secret';
        process.env.CLIENT_URL = 'http://localhost:5173';
        mockUserDoc.save.mockResolvedValue(true);
        setupJwtMocks();
    });

    describe('GET /api/health', () => {
        it('should return health status', async () => {
            const res = await request(app).get('/api/health');
            expect(res.status).toBeGreaterThanOrEqual(200);
            expect(res.body.timestamp).toBeDefined();
            expect(res.body.database).toBeDefined();
        });
    });

    describe('POST /api/auth/signup', () => {
        it('should successfully register a new user', async () => {
            User.findOne.mockResolvedValue(null);
            bcrypt.hash.mockResolvedValue('hashedPassword123');

            const mockSave = jest.fn().mockResolvedValue(true);

            User.mockImplementation(() => ({
                save: mockSave,
                _id: 'mocked_id',
                username: 'testuser',
                email: 'test@example.com',
                tokenVersion: 0,
                toObject: jest.fn().mockReturnValue({
                    _id: 'mocked_id',
                    username: 'testuser',
                    email: 'test@example.com',
                    isVerified: false,
                }),
            }));

            const res = await request(app).post('/api/auth/signup').send({
                username: 'testuser',
                email: 'test@example.com',
                password: 'Password1!',
            });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.user.verificationToken).toBeUndefined();
            expect(mockSave).toHaveBeenCalled();
        });

        it('should return 409 if user already exists', async () => {
            User.findOne.mockResolvedValue({ email: 'test@example.com' });

            const res = await request(app).post('/api/auth/signup').send({
                username: 'testuser',
                email: 'test@example.com',
                password: 'Password1!',
            });

            expect(res.status).toBe(409);
        });

        it('should return 400 if validation fails', async () => {
            const res = await request(app).post('/api/auth/signup').send({
                username: 'testuser',
                email: 'invalid-email',
                password: 'Password1!',
            });

            expect(res.status).toBe(400);
            expect(res.body.errors).toBeDefined();
        });
    });

    describe('POST /api/auth/login', () => {
        it('should successfully log in user and set cookies', async () => {
            User.findOne.mockResolvedValue(mockUserDoc);
            bcrypt.compare.mockResolvedValue(true);

            const res = await request(app).post('/api/auth/login').send({
                email: 'test@example.com',
                password: 'Password1!',
            });

            expect(res.status).toBe(200);
            expect(res.body.user.email).toBe('test@example.com');

            const cookies = res.headers['set-cookie'] || [];
            expect(cookies.some((c) => c.includes('accessToken'))).toBe(true);
            expect(cookies.some((c) => c.includes('refreshToken'))).toBe(true);
        });

        it('should return 401 for invalid credentials', async () => {
            User.findOne.mockResolvedValue(null);

            const res = await request(app).post('/api/auth/login').send({
                email: 'test@example.com',
                password: 'WrongPassword',
            });

            expect(res.status).toBe(401);
        });
    });

    describe('POST /api/auth/verifyEmail', () => {
        it('should verify email with valid code', async () => {
            const agent = await loginAndGetAgent();

            const unverifiedUser = {
                ...mockUserDoc,
                isVerified: false,
                save: jest.fn().mockResolvedValue(true),
                toObject: jest.fn().mockReturnValue({
                    _id: 'mocked_id',
                    email: 'test@example.com',
                    isVerified: true,
                }),
            };

            User.findOne.mockResolvedValue(unverifiedUser);

            const res = await agent.post('/api/auth/verifyEmail').send({
                code: '123456',
            });

            expect(res.status).toBe(200);
            expect(res.body.user.isVerified).toBe(true);
        });
    });

    describe('POST /api/auth/forgetPassword', () => {
        it('should return generic success even for unknown email', async () => {
            User.findOne.mockResolvedValue(null);

            const res = await request(app)
                .post('/api/auth/forgetPassword')
                .send({ email: 'unknown@example.com' });

            expect(res.status).toBe(200);
            expect(res.body.message).toContain('If an account exists');
        });

        it('should send reset email for known user', async () => {
            User.findOne.mockResolvedValue({
                ...mockUserDoc,
                save: jest.fn().mockResolvedValue(true),
            });

            const res = await request(app)
                .post('/api/auth/forgetPassword')
                .send({ email: 'test@example.com' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    describe('POST /api/auth/resetPassword/:token', () => {
        it('should reset password with valid token', async () => {
            User.findOne.mockResolvedValue({
                ...mockUserDoc,
                save: jest.fn().mockResolvedValue(true),
            });
            bcrypt.hash.mockResolvedValue('newHashedPassword');

            const res = await request(app)
                .post('/api/auth/resetPassword/validtoken')
                .send({ password: 'NewPass1!' });

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Password reset successfully');
        });

        it('should return 400 for invalid token', async () => {
            User.findOne.mockResolvedValue(null);

            const res = await request(app)
                .post('/api/auth/resetPassword/invalidtoken')
                .send({ password: 'NewPass1!' });

            expect(res.status).toBe(400);
        });
    });

    describe('GET /api/auth/refreshServer', () => {
        it('should return user when authenticated', async () => {
            const agent = await loginAndGetAgent();

            const res = await agent.get('/api/auth/refreshServer');

            expect(res.status).toBe(200);
            expect(res.body.user.email).toBe('test@example.com');
        });
    });

    describe('POST /api/auth/refresh', () => {
        it('should refresh access token with valid refresh cookie', async () => {
            const agent = await loginAndGetAgent();

            const res = await agent.post('/api/auth/refresh');

            expect(res.status).toBe(200);
            expect(res.body.user.email).toBe('test@example.com');
        });
    });

    describe('POST /api/auth/changePassword', () => {
        it('should change password when current password is correct', async () => {
            const agent = await loginAndGetAgent();

            bcrypt.compare.mockResolvedValue(true);
            bcrypt.hash.mockResolvedValue('newHashedPassword');

            const res = await agent.post('/api/auth/changePassword').send({
                currentPassword: 'Password1!',
                newPassword: 'NewPass2!',
            });

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Password changed successfully');
        });

        it('should return 401 when current password is wrong', async () => {
            const agent = await loginAndGetAgent();

            bcrypt.compare.mockResolvedValue(false);

            const res = await agent.post('/api/auth/changePassword').send({
                currentPassword: 'WrongPass1!',
                newPassword: 'NewPass2!',
            });

            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Current password is incorrect');
        });
    });

    describe('POST /api/auth/logout', () => {
        it('should logout successfully', async () => {
            const agent = await loginAndGetAgent();

            User.findByIdAndUpdate.mockResolvedValue({});

            const res = await agent.post('/api/auth/logout');

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('User logged out successfully');
        });
    });
});
