import { brevo, sender } from './brevo.js';
import { escapeHtml } from '../util/escapeHtml.js';
import {
    verificationEmailTemplate,
    passwordResetRequestTemplate,
    passwordResetSuccessTemplate,
} from './emailTemplate.js';

const sendEmail = async ({ to, subject, html }) => {
    return brevo.transactionalEmails.sendTransacEmail({
        sender,
        to: [{ email: to }],
        subject,
        htmlContent: html,
    });
};

export const sendVerificationEmail = async (email, verificationToken) => {
    const response = await sendEmail({
        to: email,
        subject: 'Verify your email',
        html: verificationEmailTemplate(email, verificationToken),
    });

    console.log('Email sent successfully:', response);
};

export const sendWelcomeEmail = async (email, name) => {
    const safeName = escapeHtml(name);

    const response = await sendEmail({
        to: email,
        subject: 'Welcome to our platform',
        html: `<h1>Welcome, ${safeName}!</h1><p>Thank you for verifying your email. We're excited to have you on board.</p>`,
    });

    console.log('Welcome email sent successfully:', response);
};

export const sendPasswordResetEmail = async (email, resetUrl) => {
    const response = await sendEmail({
        to: email,
        subject: 'Reset your password',
        html: passwordResetRequestTemplate(email, resetUrl),
    });

    console.log('Reset password email sent successfully:', response);
};

export const sendPasswordSuccessEmail = async (email) => {
    const response = await sendEmail({
        to: email,
        subject: 'Password reset successfully',
        html: passwordResetSuccessTemplate(email),
    });

    console.log('Password reset success email sent:', response);
};
