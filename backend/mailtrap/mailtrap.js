import { MailtrapClient } from 'mailtrap';
import dotenv from 'dotenv';
dotenv.config();

export const mailtrapClient = new MailtrapClient({
    token: process.env.MAILTRAP_APITOKEN,
});

export const sender = {
    email: 'hello@demomailtrap.co',
    name: 'Md.Shaquib',
};
