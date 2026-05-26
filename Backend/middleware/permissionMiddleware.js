import User from "../models/User.js";

export const requirePermission = (...requiredPermissions) => {

    return async (req, res, next) => {

        try {

            const user = await User.findById(req.user.id)
                .populate("roleId");

            // USER NOT FOUND
            if (!user) {

                return res.status(401).json({
                    message: "User not found",
                });

            }

            // ROLE NOT ASSIGNED
            if (!user.roleId) {

                return res.status(403).json({
                    message: "No role assigned",
                });

            }

            const role = user.roleId;

            const rolePermissions = role.permissions || [];

            // SUPER ADMIN ACCESS
            if (rolePermissions.includes("*")) {

                req.auth = {
                    user,
                    role,
                    permissions: rolePermissions,
                    hierarchyLevel: role.hierarchyLevel,
                    dataScope: role.dataScope,
                };

                return next();

            }

            // CHECK REQUIRED PERMISSIONS
            const hasPermission = requiredPermissions.every((permission) =>
                rolePermissions.includes(permission)
            );

            if (!hasPermission) {

                return res.status(403).json({
                    message: "Insufficient permissions",
                });

            }

            // ATTACH AUTH CONTEXT
            req.auth = {
                user,
                role,
                permissions: rolePermissions,
                hierarchyLevel: role.hierarchyLevel,
                dataScope: role.dataScope,
            };

            next();

        } catch (error) {

            return res.status(500).json({
                message: error.message,
            });

        }

    };

};
