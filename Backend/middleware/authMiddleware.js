import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    try {

        const token = req.cookies?.accessToken;

        if (!token) {
            return res.status(401).json({
                message: "Not authorized, no token",
            });
        }

        // Verify JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Fetch user + role
        const user = await User.findById(decoded.id)
            .populate("roleId")
            .populate("managerId");

        if (!user) {
            return res.status(401).json({
                message: "User not found",
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                message: "User account is inactive",
            });
        }

        // Create req.user BEFORE logging it
        req.user = {
            _id: user._id,
            id: user._id,
            username: user.username,
            role: user.roleId,
            managerId: user.managerId,
            teamId: user.teamId,
            modulePermissions:
                user.roleId?.modulePermissions || {},
        };

        next();

    } catch (error) {

        console.error(
            "AUTH MIDDLEWARE ERROR:"
        );

        console.error(error);

        console.error(
            error?.stack
        );

        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }
};