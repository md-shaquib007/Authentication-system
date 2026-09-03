export const sanitizeUser = (user) => {
    const doc = user?.toObject ? user.toObject() : { ...user };

    delete doc.password;
    delete doc.verificationToken;
    delete doc.verificationTokenExpiresAt;
    delete doc.resetPasswordToken;
    delete doc.resetPasswordTokenExpiresAt;
    delete doc.tokenVersion;
    delete doc.failedLoginAttempts;
    delete doc.lockUntil;
    delete doc.verificationTokenAttempts;

    return doc;
};
