export const requireModulePermission =
    (module, action) =>
    (req, res, next) => {

        try {

            const role =
                req.user?.role;

            if (!role) {

                return res.status(401).json({
                    message: "Unauthorized",
                });
            }

            if (
                role.name ===
                "super_admin"
            ) {
                return next();
            }

            const value =
                role.modulePermissions?.[
                    module
                ]?.[action];

            if (
                !value ||
                value === "none"
            ) {

                return res.status(403).json({
                    message:
                        "Access denied",
                });
            }

            next();

        } catch (error) {

            return res.status(500).json({
                message:
                    error.message,
            });
        }
    };