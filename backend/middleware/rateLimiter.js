import { getRateLimitStore } from './rateLimitStore.js';

export const createRateLimiter =
    ({ windowMs = 15 * 60 * 1000, max = 100 } = {}) =>
    async (req, res, next) => {
        try {
            const store = await getRateLimitStore();
            const key = `${req.ip}:${req.baseUrl}${req.path}`;
            const count = await store.increment(key, windowMs);

            if (count > max) {
                return res.status(429).json({
                    message: 'Too many requests, please try again later',
                });
            }

            next();
        } catch (error) {
            console.error('Rate limiter error:', error);
            next();
        }
    };

export const authRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 30,
});

export const verifyRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
});
