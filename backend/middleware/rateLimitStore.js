class MemoryRateLimitStore {
    constructor() {
        this.hits = new Map();
        this.cleanupInterval = setInterval(() => {
            const now = Date.now();
            for (const [key, record] of this.hits) {
                if (now - record.start > record.windowMs) {
                    this.hits.delete(key);
                }
            }
        }, 60000);
        this.cleanupInterval.unref();
    }

    async increment(key, windowMs) {
        const now = Date.now();
        let record = this.hits.get(key);

        if (!record || now - record.start > windowMs) {
            record = { start: now, count: 0, windowMs };
        }

        record.count += 1;
        this.hits.set(key, record);

        return record.count;
    }
}

class RedisRateLimitStore {
    constructor(client) {
        this.client = client;
    }

    async increment(key, windowMs) {
        const redisKey = `ratelimit:${key}`;
        const count = await this.client.incr(redisKey);

        if (count === 1) {
            await this.client.pExpire(redisKey, windowMs);
        }

        return count;
    }
}

let storePromise;

export const getRateLimitStore = async () => {
    if (storePromise) return storePromise;

    storePromise = (async () => {
        if (process.env.REDIS_URL) {
            try {
                const { createClient } = await import('redis');
                const client = createClient({ url: process.env.REDIS_URL });
                client.on('error', (err) =>
                    console.error('Redis rate limit error:', err.message)
                );
                await client.connect();
                console.log('Rate limiting: using Redis store');
                return new RedisRateLimitStore(client);
            } catch (error) {
                console.warn(
                    'Redis unavailable, falling back to in-memory rate limiting:',
                    error.message
                );
            }
        }

        return new MemoryRateLimitStore();
    })();

    return storePromise;
};
