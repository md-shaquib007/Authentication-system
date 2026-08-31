import bcrypt from 'bcryptjs';
import User from '../model/userModel.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import {
    generateRefreshTokenAndSetCookie,
    generateAccessToken,
    setAccessTokenCookie,
    clearAuthCookies,
} from '../util/tokenHelpers.js';
import { sanitizeUser } from '../util/sanitizeUser.js';
import {
    sendVerificationEmail,
    sendWelcomeEmail,
    sendPasswordSuccessEmail,
    sendPasswordResetEmail,
} from '../email/email.js';

const register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res
                .status(409)
                .json({ message: `User already exists with email : ${email}` });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const verificationToken = crypto.randomInt(100000, 999999).toString();

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            loggedIn: true,
            verificationTokenExpiresAt: new Date(
                Date.now() + 24 * 60 * 60 * 1000
            ),
            verificationToken,
        });

        await newUser.save();

        try {
            generateRefreshTokenAndSetCookie(
                res,
                newUser._id,
                newUser.tokenVersion
            );

            const accessToken = generateAccessToken(
                newUser._id,
                newUser.email,
                newUser.tokenVersion
            );
            setAccessTokenCookie(res, accessToken);

            await sendVerificationEmail(newUser.email, verificationToken);
        } catch (emailError) {
            await User.findByIdAndDelete(newUser._id);
            clearAuthCookies(res);
            console.log(emailError);
            return res.status(500).json({
                message: 'Failed to send verification email. Please try again.',
            });
        }

        res.status(201).json({
            success: true,
            message: `User registered successfully with username : ${username} and ${email}`,
            user: sanitizeUser(newUser),
        });
    } catch (error) {
        console.log(error);

        if (error.code === 11000) {
            return res.status(409).json({
                message: `User already exists with email : ${email}`,
            });
        }

        res.status(500).json({
            message: 'Something went wrong in registering',
        });
    }
};

const VerifyEmail = async (req, res) => {
    const { code } = req.body;

    try {
        const user = await User.findOne({
            _id: req.userId,
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() },
        });

        if (!user) {
            return res
                .status(400)
                .json({ message: 'Invalid or expired verification token' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;

        await user.save();

        try {
            await sendWelcomeEmail(user.email, user.username);
        } catch (emailError) {
            console.log('Welcome email failed:', emailError);
        }

        res.status(200).json({
            success: true,
            message: 'Email verified successfully',
            user: sanitizeUser(user),
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Something went wrong in email verification',
        });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const checkPassword = await bcrypt.compare(password, user.password);
        if (!checkPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        user.lastLogin = new Date();
        user.loggedIn = true;
        await user.save();

        generateRefreshTokenAndSetCookie(res, user._id, user.tokenVersion);

        const accessToken = generateAccessToken(
            user._id,
            user.email,
            user.tokenVersion
        );
        setAccessTokenCookie(res, accessToken);

        res.status(200).json({
            success: true,
            message: 'User logged in successfully',
            user: sanitizeUser(user),
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Something went wrong in logging in user',
        });
    }
};

const logout = async (req, res) => {
    try {
        if (req.userId) {
            await User.findByIdAndUpdate(req.userId, {
                loggedIn: false,
                loggedOutDate: new Date(),
            });
        }

        clearAuthCookies(res);

        res.status(200).json({ message: 'User logged out successfully' });
    } catch (error) {
        console.log(error);
        clearAuthCookies(res);
        return res.status(500).json({
            message: 'Something went wrong while logging out',
        });
    }
};

const forgetPassword = async (req, res) => {
    const email = req.body.email;
    const genericMessage =
        'If an account exists for this email, a password reset link has been sent';

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(200).json({
                success: true,
                message: genericMessage,
            });
        }

        const resetPasswordToken = crypto.randomBytes(32).toString('hex');
        const resetPasswordTokenExpiresAt = new Date(
            Date.now() + 1 * 60 * 60 * 1000
        );

        if (!process.env.CLIENT_URL) {
            return res.status(500).json({
                message: 'Server configuration error',
            });
        }

        user.resetPasswordToken = resetPasswordToken;
        user.resetPasswordTokenExpiresAt = resetPasswordTokenExpiresAt;

        await user.save();

        try {
            await sendPasswordResetEmail(
                user.email,
                `${process.env.CLIENT_URL}/resetPassword/${resetPasswordToken}`
            );
        } catch (emailError) {
            user.resetPasswordToken = undefined;
            user.resetPasswordTokenExpiresAt = undefined;
            await user.save();
            console.log(emailError);
            return res.status(500).json({
                message: 'Failed to send reset email. Please try again.',
            });
        }

        res.status(200).json({
            success: true,
            message: genericMessage,
        });
    } catch (error) {
        console.log('Error in forget password:', error);
        res.status(500).json({
            message: 'Something went wrong while sending reset email',
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordTokenExpiresAt: { $gt: Date.now() },
        });

        if (!user) {
            return res
                .status(400)
                .json({ message: 'Invalid or expired token' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpiresAt = undefined;
        user.tokenVersion = (user.tokenVersion || 0) + 1;

        await user.save();

        try {
            await sendPasswordSuccessEmail(user.email);
        } catch (emailError) {
            console.log('Password success email failed:', emailError);
        }

        clearAuthCookies(res);

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.log('Error in reset password:', error);
        res.status(500).json({
            message: 'Something went wrong in resetting the password',
        });
    }
};

const refreshServer = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            user: sanitizeUser(user),
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Something went wrong in refreshing server',
        });
    }
};

const resendVerification = async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Email is already verified' });
        }

        const verificationToken = crypto.randomInt(100000, 999999).toString();
        user.verificationToken = verificationToken;
        user.verificationTokenExpiresAt = new Date(
            Date.now() + 24 * 60 * 60 * 1000
        );

        await user.save();

        await sendVerificationEmail(user.email, verificationToken);

        res.status(200).json({
            success: true,
            message: 'A new verification code has been sent to your email',
        });
    } catch (error) {
        console.log('Error resending verification:', error);
        res.status(500).json({
            message: 'Failed to send verification email. Please try again.',
        });
    }
};

const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return res
                .status(401)
                .json({ message: 'Current password is incorrect' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.tokenVersion = (user.tokenVersion || 0) + 1;
        await user.save();

        generateRefreshTokenAndSetCookie(res, user._id, user.tokenVersion);

        const accessToken = generateAccessToken(
            user._id,
            user.email,
            user.tokenVersion
        );
        setAccessTokenCookie(res, accessToken);

        try {
            await sendPasswordSuccessEmail(user.email);
        } catch (emailError) {
            console.log('Password change notification failed:', emailError);
        }

        res.status(200).json({
            success: true,
            message: 'Password changed successfully',
            user: sanitizeUser(user),
        });
    } catch (error) {
        console.log('Error changing password:', error);
        res.status(500).json({
            message: 'Something went wrong while changing password',
        });
    }
};

const refreshAccessToken = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token not found' });
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        if (
            decoded.tokenVersion !== undefined &&
            decoded.tokenVersion !== user.tokenVersion
        ) {
            clearAuthCookies(res);
            return res.status(401).json({ message: 'Session invalidated' });
        }

        generateRefreshTokenAndSetCookie(res, user._id, user.tokenVersion);

        const accessToken = generateAccessToken(
            user._id,
            user.email,
            user.tokenVersion
        );
        setAccessTokenCookie(res, accessToken);

        res.status(200).json({
            success: true,
            user: sanitizeUser(user),
        });
    } catch (error) {
        console.log(error);
        clearAuthCookies(res);
        return res.status(401).json({
            message: 'Invalid or expired refresh token',
        });
    }
};

export {
    register,
    login,
    logout,
    VerifyEmail,
    resetPassword,
    forgetPassword,
    refreshServer,
    refreshAccessToken,
    resendVerification,
    changePassword,
};
