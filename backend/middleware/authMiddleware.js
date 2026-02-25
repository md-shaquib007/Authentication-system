import jwt from 'jsonwebtoken';

const verifyJWT = (req, res, next) => {
    try {
        const token = req.cookies?.accessToken;

        if (!token) {
            return res
                .status(401)
                .json({ message: `Token not found , Unauthorised access` });
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        req.userId = decodedToken.id;

        console.log('decoded token provided to user: verifyJWT is passed');

        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            message: `Unauthorised , Invalid or expired token`,
        });
    }
};

export default verifyJWT;
