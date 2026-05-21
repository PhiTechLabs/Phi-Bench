import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {

    const token = req.cookies?.accessToken;

    if (!token) {
        return res.status(401).json({
            message: "Not authorized, no token",
        });
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            id: decoded.id,
            role: decoded.role,
        };

        next();

    } catch (error) {

        return res.status(401).json({
            message: "Token invalid or expired",
        });

    }

};