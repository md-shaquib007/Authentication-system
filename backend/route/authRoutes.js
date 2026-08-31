import express from 'express';
import {
    login,
    logout,
    register,
    VerifyEmail,
    resetPassword,
    forgetPassword,
    refreshServer,
    refreshAccessToken,
    resendVerification,
    changePassword,
} from '../controller/authController.js';
import verifyJWT from '../middleware/authMiddleware.js';
import optionalAuth from '../middleware/optionalAuth.js';
import { validateBody } from '../middleware/validationMiddleware.js';
import {
    authRateLimiter,
    verifyRateLimiter,
} from '../middleware/rateLimiter.js';
import {
    signupSchema,
    loginSchema,
    verifyEmailSchema,
    forgetPasswordSchema,
    resetPasswordSchema,
    changePasswordSchema,
} from '../util/validationSchemas.js';

const router = express.Router();

router.post('/signup', authRateLimiter, validateBody(signupSchema), register);
router.post('/login', authRateLimiter, validateBody(loginSchema), login);
router.post('/logout', optionalAuth, logout);

router.post(
    '/verifyEmail',
    verifyRateLimiter,
    verifyJWT,
    validateBody(verifyEmailSchema),
    VerifyEmail
);

router.post(
    '/forgetPassword',
    authRateLimiter,
    validateBody(forgetPasswordSchema),
    forgetPassword
);

router.post(
    '/resetPassword/:token',
    authRateLimiter,
    validateBody(resetPasswordSchema),
    resetPassword
);

router.post(
    '/resendVerification',
    verifyRateLimiter,
    verifyJWT,
    resendVerification
);

router.post(
    '/changePassword',
    authRateLimiter,
    verifyJWT,
    validateBody(changePasswordSchema),
    changePassword
);

router.get('/refreshServer', verifyJWT, refreshServer);
router.post('/refresh', refreshAccessToken);

export default router;
