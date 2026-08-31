import { z } from 'zod';

const envSchema = z.object({
    NODE_ENV: z
        .enum(['development', 'production', 'test'])
        .default('development'),
    PORT: z.string().optional(),
    MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
    ACCESS_TOKEN_SECRET: z.string().min(1, 'ACCESS_TOKEN_SECRET is required'),
    REFRESH_TOKEN_SECRET: z.string().min(1, 'REFRESH_TOKEN_SECRET is required'),
    ACCESS_TOKEN_EXPIRY: z.string().optional(),
    REFRESH_TOKEN_EXPIRY: z.string().optional(),
    CLIENT_URL: z.string().optional(),
    BREVO_API_KEY: z.string().optional(),
    SENDER_EMAIL: z.string().optional(),
    SENDER_NAME: z.string().optional(),
    REDIS_URL: z.string().optional(),
});

export const validateEnv = () => {
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
        console.error(
            'Invalid environment variables:',
            result.error.flatten().fieldErrors
        );
        process.exit(1);
    }

    if (process.env.NODE_ENV === 'production') {
        const required = ['BREVO_API_KEY', 'SENDER_EMAIL', 'CLIENT_URL'];
        const missing = required.filter((key) => !process.env[key]);

        if (missing.length > 0) {
            console.error(
                `Missing required production env vars: ${missing.join(', ')}`
            );
            process.exit(1);
        }
    }
};
