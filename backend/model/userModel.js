import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
            trim: true,
        },

        lastLogin: {
            type: Date,
            default: Date.now(),
        },

        isVerified: {
            type: Boolean,
            default: false,
        },

        resetPasswordToken: {
            type: String,
        },

        resetPasswordTokenExpiresAt: {
            type: Date,
        },

        verificationToken: {
            type: String,
        },

        verificationTokenExpiresAt: {
            type: Date,
        },

        loggedIn: {
            type: Boolean,
        },

        loggedOutDate: {
            type: Date,
        },
    },

    { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
