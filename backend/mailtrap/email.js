import { mailtrapClient, sender } from './mailtrap.js';
import { verificationEmailTemplate } from './emailTemplate.js';
import { passwordResetRequestTemplate } from './emailTemplate.js';
import { passwordResetSuccessTemplate } from './emailTemplate.js';

export const sendVerificationEmail = async (email, verificationToken) => {
    const recipient = [{ email }];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: 'Verify your email',
            html: verificationEmailTemplate(email, verificationToken),
            category: 'Email Verification',
        });

        console.log('Email sent successfully : ', response);
    } catch (error) {
        console.log('Error in sending verification email : ', error);
    }
};

// Template -> through uuid
export const sendWelcomeEmail = async (email, name) => {
    const recipient = [{ email }];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: 'Welcome to our platform',
            html: `<h1>Welcome, ${name}!</h1><p>Thank you for verifying your email. We're excited to have you on board.</p>`,
            category: 'Welcome Email',
        });

        console.log('Welcome email sent succesfully : ', response);
    } catch (error) {
        console.log('Error in sending welcome email : ', error);
    }
};

export const sendPasswordResetEmail = async (email, resetUrl) => {
    const recipient = [{ email }];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: 'Reset your password',
            html: passwordResetRequestTemplate(email, resetUrl),
            category: 'Password reset',
        });

        console.log('Reset email password sent successfully : ', response);
    } catch (error) {
        console.log('Error in sending password through reset email : ', error);
    }
};

export const sendPasswordSuccessEmail = async (email) => {
    const recipient = [{ email }];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: 'Password reset successfully',
            html: passwordResetSuccessTemplate(email),
            category: 'Success Reset',
        });

        console.log('Password reset successfully : ', response);
    } catch (error) {
        console.log('Something went wrong in success pssword reset : ', error);
    }
};
