import { BrevoClient } from '@getbrevo/brevo';
import dotenv from 'dotenv';

dotenv.config();

export const brevo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY,
});

export const sender = {
    email: process.env.SENDER_EMAIL,
    name: process.env.SENDER_NAME || 'MERN Auth',
};
