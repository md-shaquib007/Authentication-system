import bcrypt from 'bcryptjs';
import User from '../model/userModel.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { generateRefreshTokenAndSetCookie } from '../util/generateRefreshTokenAndSetCookie.js';
import {
    sendVerificationEmail,
    sendWelcomeEmail,
    sendPasswordSuccessEmail,
    sendPasswordResetEmail,
} from '../mailtrap/email.js';

// sendVerificationEmail
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

        const verificationToken = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            loggedIn: true,
            verificationTokenExpiresAt: new Date(
                Date.now() + 24 * 60 * 60 * 1000
            ), //24 hours
            verificationToken,
        });

        await newUser.save();

        // JWT (Generate both Refresh and Access Tokens)
        generateRefreshTokenAndSetCookie(res, newUser._id);

        const accessToken = jwt.sign(
            {
                id: newUser._id,
                email: newUser.email,
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '12h',
            }
        );

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 12 * 60 * 60 * 1000,
        });

        //VerifyEmail
        await sendVerificationEmail(newUser.email, verificationToken);

        res.status(201).json({
            success: true,
            message: `User registered succesfully with username : ${username} and ${email}`,
            user: {
                ...newUser._doc,
                password: undefined,
            },
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: `Something went wrong in registering : ${error}`,
        });
    }
};

// sendWelcomeEmail:Template
const VerifyEmail = async (req, res) => {
    const { code } = req.body;

    try {
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() },
        });

        if (!user) {
            return res
                .status(400)
                .json({ message: `Invalid or expired verification Token` });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;

        await user.save();

        await sendWelcomeEmail(user.email, user.username);

        res.status(200).json({
            success: true,
            message: `Email verified successfully`,
            user: {
                ...user._doc,
                password: undefined,
            },
        });
    } catch (error) {
        res.status(400).json({
            message: `Something went wrong in email verification : ${error}`,
        });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: `Invalid credentials` });
        }

        const checkPassword = await bcrypt.compare(password, user.password);
        if (!checkPassword) {
            return res.status(401).json({ message: `Invalid credentials` });
        }

        const accessToken = jwt.sign(
            {
                id: user._id,
                email: user.email,
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '12h',
            }
        );

        user.lastLogin = new Date();

        await user.save();

        // Set refresh token cookie as well
        generateRefreshTokenAndSetCookie(res, user._id);

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 12 * 60 * 60 * 1000,
        })
            .status(200)
            .json({
                success: true,
                message: `User logged in successfully`,
                user: {
                    ...user._doc,
                    password: undefined,
                },
            });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: `Something went wrong in logging in user : ${error}`,
        });
    }
};

const logout = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.userId, {
            loggedIn: false,
            loggedOutDate: new Date(Date.now()),
        });

        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });

        res.status(200).json({ message: `User logged out successfully` });

        console.log('User logged out, Hurray');
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: `Something went wrong while logging out : ${error}`,
        });
    }
};

// sendPasswordResetEmail
const forgetPassword = async (req, res) => {
    const email = req.body.email;
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const resetPasswordToken = crypto.randomBytes(20).toString('hex');
        const resetPasswordTokenExpiresAt = new Date(
            Date.now() + 1 * 60 * 60 * 1000
        ); // 1hr

        user.resetPasswordToken = resetPasswordToken;
        user.resetPasswordTokenExpiresAt = resetPasswordTokenExpiresAt;

        await user.save();

        await sendPasswordResetEmail(
            user.email,
            `${process.env.CLIENT_URL}/resetPassword/${resetPasswordToken}`
        );

        res.status(200).json({
            success: true,
            message: 'reset email send succesfully',
        });
    } catch (error) {
        console.log(
            'Something went wrong in way of resetting passwrod : ',
            error
        );
        res.status(500).json({
            message: `Something went wrong in way of resetting password through email ${error}`,
        });
    }
};

// sendPasswordSuccessEmail
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

        //update password
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;

        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpiresAt = undefined;

        await user.save();

        await sendPasswordSuccessEmail(user.email);

        res.status(200).json({ message: `Password reset successfully` });
    } catch (error) {
        console.log('Something went wrong in resetting password : ', error);

        res.status(500).json({
            message: `Something went wrong in resetting the password ${error}`,
        });
    }
};

const refreshServer = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        console.log('Refreshed user info sent, refresh successfull');
        res.status(200).json({
            success: true,
            user: user,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: `Something went wrong in refreshing server : ${error}`,
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
};
