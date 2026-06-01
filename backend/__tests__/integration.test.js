import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import User from '../model/userModel.js';
import bcrypt from 'bcryptjs';

jest.mock('../model/userModel.js');

jest.mock('bcryptjs');

jest.mock('../mailtrap/email.js', () => ({
    sendVerificationEmail: jest.fn().mockResolvedValue(true),
    sendWelcomeEmail: jest.fn().mockResolvedValue(true),
    sendPasswordSuccessEmail: jest.fn().mockResolvedValue(true),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
}));

describe('Auth Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.ACCESS_TOKEN_SECRET = 'test_access_secret';
        process.env.REFRESH_TOKEN_SECRET = 'test_refresh_secret';
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
                _doc: {
                    _id: 'mocked_id',
                    username: 'testuser',
                    email: 'test@example.com',
                },
            }));

            const res = await request(app).post('/api/auth/signup').send({
                username: 'testuser',
                email: 'test@example.com',
                password: 'Password1!',
            });

            expect(res.status).toBe(201);

            expect(res.body.success).toBe(true);
            expect(res.body.user.username).toBe('testuser');
            expect(res.body.user.email).toBe('test@example.com');

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
            expect(res.body.message).toContain('User already exists');
        });

        it('should return 400 if validation fails (e.g. invalid email)', async () => {
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
            const mockUser = {
                _id: 'mocked_id',
                email: 'test@example.com',
                password: 'hashedPassword123',
                save: jest.fn().mockResolvedValue(true),
                _doc: {
                    _id: 'mocked_id',
                    email: 'test@example.com',
                },
            };

            User.findOne.mockResolvedValue(mockUser);

            bcrypt.compare.mockResolvedValue(true);

            const res = await request(app).post('/api/auth/login').send({
                email: 'test@example.com',
                password: 'Password1!',
            });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.user.email).toBe('test@example.com');

            const cookies = res.headers['set-cookie'] || [];
            expect(
                cookies.some((cookie) => cookie.includes('accessToken'))
            ).toBe(true);
            expect(
                cookies.some((cookie) => cookie.includes('refreshToken'))
            ).toBe(true);
        });

        it('should return 401 for invalid credentials', async () => {
            User.findOne.mockResolvedValue(null);

            const res = await request(app).post('/api/auth/login').send({
                email: 'test@example.com',
                password: 'WrongPassword',
            });

            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Invalid credentials');
        });
    });
});
