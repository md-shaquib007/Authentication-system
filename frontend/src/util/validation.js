export const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validatePassword = (password) => {
    const errors = [];

    if (password.length < 6) {
        errors.push('At least 6 characters');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('One lowercase letter');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('One uppercase letter');
    }
    if (!/\d/.test(password)) {
        errors.push('One number');
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
        errors.push('One special character');
    }

    return errors;
};

export const isPasswordValid = (password) =>
    validatePassword(password).length === 0;

export const validateUsername = (username) => {
    if (username.trim().length < 3) return 'Username must be at least 3 characters';
    if (username.trim().length > 30) return 'Username cannot exceed 30 characters';
    return null;
};

export const maskEmail = (email) => {
    if (!email) return '';
    const [local, domain] = email.split('@');
    if (!domain) return email;
    const masked =
        local.length <= 2
            ? `${local[0]}*`
            : `${local[0]}${'*'.repeat(Math.min(local.length - 2, 4))}${local.slice(-1)}`;
    return `${masked}@${domain}`;
};
