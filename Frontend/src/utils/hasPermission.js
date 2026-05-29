export const hasPermission = (user, permission) => {

    if (!user) return false;

    // ───────────────── SUPER ADMIN FULL ACCESS ─────────────────
    if (
        user.role === "super_admin" ||
        user.role?.name === "super_admin"
    ) {
        return true;
    }

    const permissions = user.permissions || [];

    // Wildcard permission
    if (permissions.includes("*")) {
        return true;
    }

    return permissions.includes(permission);
};