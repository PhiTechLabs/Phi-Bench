export const requirePermission = (...requiredPermissions) => {

    return (req, res, next) => {

        // ─── USER MUST EXIST ───────────────────────────────
        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const userPermissions = req.user.permissions || [];

        // ─── SUPER ADMIN WILDCARD ACCESS ──────────────────
        if (userPermissions.includes("*")) {
            return next();
        }

        // ─── NORMAL PERMISSION CHECK ──────────────────────
        const hasPermission = requiredPermissions.some(
            permission => userPermissions.includes(permission)
        );

        if (!hasPermission) {
            return res.status(403).json({
                message: "Forbidden",
            });
        }

        next();
    };
};