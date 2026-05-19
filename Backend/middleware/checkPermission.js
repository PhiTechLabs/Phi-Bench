export const checkPermission = (requiredPermission) => {

    return (req, res, next) => {

        try {

            const userPermissions = req.user?.permissions || [];

            // superAdmin bypass
            if (req.user?.role === "superAdmin") {
                return next();
            }

            // permission check
            if (!userPermissions.includes(requiredPermission)) {

                return res.status(403).json({
                    message: "Access denied",
                });

            }

            next();

        } catch (error) {

            res.status(500).json({
                message: error.message,
            });

        }

    };

};