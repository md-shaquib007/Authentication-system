export const parseExpiryToMs = (expiry) => {
    if (!expiry) return undefined;

    const match = String(expiry).match(/^(\d+)([smhd])$/);
    if (!match) return undefined;

    const value = parseInt(match[1], 10);
    const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };

    return value * multipliers[match[2]];
};
