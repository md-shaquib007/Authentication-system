import { ZodError } from 'zod';

export const validateBody = (schema) => (req, res, next) => {
    try {
        req.body = schema.parse(req.body);
        next();
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                message: error.issues.map((e) => e.message).join(', '),
                errors: error.issues,
            });
        }
        next(error);
    }
};
