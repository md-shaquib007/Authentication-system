import jwt from 'jsonwebtoken';
import User from '../model/userModel.js';

const verifyJWT = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken;

        if (!token) {
            return res
                .status(401)
                .json({ message: 'Token not found, unauthorised access' });
        }

        const decodedToken = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        );

        const query = User.findById(decodedToken.id).select('tokenVersion');
        const user = query && query.lean ? await query.lean() : await query;

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        if (
            decodedToken.tokenVersion !== undefined &&
            decodedToken.tokenVersion !== user.tokenVersion
        ) {
            return res.status(401).json({ message: 'Session invalidated' });
        }

        req.userId = decodedToken.id;

        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            message: 'Unauthorised, invalid or expired token',
        });
    }
};

export default verifyJWT;
