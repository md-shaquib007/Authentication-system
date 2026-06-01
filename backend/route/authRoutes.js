import express from 'express';
import {
    login,
    logout,
    register,
    VerifyEmail,
    resetPassword,
    forgetPassword,
    refreshServer,
} from '../controller/authController.js';
import verifyJWT from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validationMiddleware.js';
import {
    signupSchema,
    loginSchema,
    verifyEmailSchema,
    forgetPasswordSchema,
    resetPasswordSchema,
} from '../util/validationSchemas.js';

const router = express.Router();

router.post('/signup', validateBody(signupSchema), register);
router.post('/login', validateBody(loginSchema), login);

// middleware
router.post('/logout', verifyJWT, logout);

router.post('/verifyEmail', validateBody(verifyEmailSchema), VerifyEmail);

router.post('/forgetPassword', validateBody(forgetPasswordSchema), forgetPassword);

router.post('/resetPassword/:token', validateBody(resetPasswordSchema), resetPassword);

router.get('/refreshServer', verifyJWT, refreshServer);

export default router;
