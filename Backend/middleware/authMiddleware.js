import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {

    const token = req.cookies?.accessToken;

    if (!token) {

        return res.status(401).json({
            message: "Not authorized, no token",
        });
    }

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // ─────────────────────────────────────────────
        // FETCH USER WITH ROLE
        // ─────────────────────────────────────────────
        const user = await User.findById(decoded.id)
            .populate("roleId");

        if (!user) {

            return res.status(401).json({
                message: "User not found",
            });
        }

        // ─────────────────────────────────────────────
        // BLOCK INACTIVE USERS
        // ─────────────────────────────────────────────
        if (!user.isActive) {

            return res.status(403).json({
                message: "User account is inactive",
            });
        }

        // ─────────────────────────────────────────────
        // ATTACH USER TO REQUEST
        // ─────────────────────────────────────────────
        req.user = {

            id: user._id,

            username: user.username,

            // FULL ROLE OBJECT
            role: user.roleId,

            // EASY ACCESS
            permissions:
                user.roleId?.permissions || [],

        };

        next();

    } catch (error) {

        return res.status(401).json({
            message: "Token invalid or expired",
        });
    }
};