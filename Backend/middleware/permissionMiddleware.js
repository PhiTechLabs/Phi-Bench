import User from "../models/User.js";

export const requirePermission  = (...requiredPermissions) => {
    return async (req, res, next) => {

        try {

            const user = await User.findById(req.user.id)
                .populate("roleId");

            if (!user || !user.roleId) {
                return res.status(403).json({
                    message: "Access denied"
                });
            }

            const rolePermissions = user.roleId.permissions || [];

            // SuperAdmin shortcut
            if (rolePermissions.includes("*")) {
                return next();
            }

            const hasPermission = requiredPermissions.every(permission =>
                rolePermissions.includes(permission)
            );

            if (!hasPermission) {
                return res.status(403).json({
                    message: "Insufficient permissions"
                });
            }

            next();

        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }

    };
};