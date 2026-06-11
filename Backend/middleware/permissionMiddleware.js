export const requirePermission =
    (module, action) =>
    (req, res, next) => {

        try {

            const role = req.user?.role;

            // console.log("MODULE:", module);
            // console.log("ACTION:", action);
            // console.log(
            //     "VALUE:",
            //     role?.modulePermissions?.[module]?.[action]
            // );

            if (!role) {

                return res.status(401).json({
                    message: "Unauthorized",
                });

            }

            // Super Admin Bypass
            if (role.name === "super_admin") {
                return next();
            }

            const modulePermissions =
                role?.modulePermissions?.[module];

            if (!modulePermissions) {

                return res.status(403).json({
                    message: `Module '${module}' not configured`,
                });

            }

            const permission =
                modulePermissions[action];

            if (
                !permission ||
                permission === "none"
            ) {

                return res.status(403).json({
                    message: "Access denied",
                });

            }

            next();

        } catch (error) {

            return res.status(500).json({
                message: error.message,
            });

        }
    };