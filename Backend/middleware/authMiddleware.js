import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
    // ✅ Read token from HttpOnly cookie (not Authorization header anymore)
    const token = req.cookies?.accessToken;

    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, role }
        console.log(req.user);
        next();
    } catch (error) {
        res.status(401).json({ message: "Token invalid or expired" });
    }
};