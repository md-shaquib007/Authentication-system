import { brevo, sender } from './brevo.js';
import { escapeHtml } from '../util/escapeHtml.js';
import {
    verificationEmailTemplate,
    passwordResetRequestTemplate,
    passwordResetSuccessTemplate,
} from './emailTemplate.js';

const sendEmail = async ({ to, subject, html }) => {
    if (!process.env.BREVO_API_KEY) {
        console.log(`\n--- [DEV EMAIL MOCK] ---`);
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`------------------------\n`);
        return { mock: true };
    }

    return brevo.transactionalEmails.sendTransacEmail({
        sender,
        to: [{ email: to }],
        subject,
        htmlContent: html,
    });
};

export const sendVerificationEmail = async (email, verificationToken) => {
    try {
        const response = await sendEmail({
            to: email,
            subject: 'Verify your email',
            html: verificationEmailTemplate(email, verificationToken),
        });
        console.log('Verification email sent successfully:', response);
    } catch (error) {
        console.error('Error sending verification email:', error?.message || error);
    } finally {
        console.log(`\n==============================================`);
        console.log(`[VERIFICATION CODE FOR ${email}]: ${verificationToken}`);
        console.log(`==============================================\n`);
    }
};

export const sendWelcomeEmail = async (email, name) => {
    const safeName = escapeHtml(name || 'User');

    try {
        const response = await sendEmail({
            to: email,
            subject: 'Welcome to our platform',
            html: `<h1>Welcome, ${safeName}!</h1><p>Thank you for verifying your email. We're excited to have you on board.</p>`,
        });
        console.log('Welcome email sent successfully:', response);
    } catch (error) {
        console.error('Error sending welcome email:', error?.message || error);
    }
};

export const sendPasswordResetEmail = async (email, resetUrl) => {
    try {
        const response = await sendEmail({
            to: email,
            subject: 'Reset your password',
            html: passwordResetRequestTemplate(email, resetUrl),
        });
        console.log('Reset password email sent successfully:', response);
    } catch (error) {
        console.error('Error sending reset password email:', error?.message || error);
    } finally {
        console.log(`\n==============================================`);
        console.log(`[RESET PASSWORD LINK FOR ${email}]: ${resetUrl}`);
        console.log(`==============================================\n`);
    }
};

export const sendPasswordSuccessEmail = async (email) => {
    try {
        const response = await sendEmail({
            to: email,
            subject: 'Password reset successfully',
            html: passwordResetSuccessTemplate(email),
        });
        console.log('Password reset success email sent:', response);
    } catch (error) {
        console.error('Error sending password success email:', error?.message || error);
    }
};
