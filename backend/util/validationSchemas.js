import { z } from 'zod';

const passwordSchema = z.string()
    .min(6, 'Password must be at least 6 characters long')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

export const signupSchema = z.object({
    username: z.string()
        .min(3, 'Username must be at least 3 characters long')
        .max(30, 'Username cannot exceed 30 characters')
        .trim(),
    email: z.string()
        .email('Invalid email address')
        .trim()
        .toLowerCase(),
    password: passwordSchema,
});

export const loginSchema = z.object({
    email: z.string()
        .email('Invalid email address')
        .trim()
        .toLowerCase(),
    password: z.string().min(1, 'Password is required'),
});

export const verifyEmailSchema = z.object({
    code: z.string()
        .length(6, 'Verification code must be exactly 6 digits')
        .regex(/^\d+$/, 'Verification code must contain only digits'),
    email: z.string().email('Invalid email address').trim().toLowerCase().optional(),
});

export const forgetPasswordSchema = z.object({
    email: z.string()
        .email('Invalid email address')
        .trim()
        .toLowerCase(),
});

export const resetPasswordSchema = z.object({
    password: passwordSchema,
});

export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: passwordSchema,
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
        message: 'New password must be different from current password',
        path: ['newPassword'],
    });
