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

const router = express.Router();

router.post('/signup', register);
router.post('/login', login);

// middleware
router.post('/logout', logout);

router.post('/verifyEmail', VerifyEmail);

router.post('/forgetPassword', forgetPassword);

router.post('/resetPassword/:token', resetPassword);

router.get('/refreshServer', verifyJWT, refreshServer);

export default router;
