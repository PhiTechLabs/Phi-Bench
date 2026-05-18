export const hasPermission = (user, permission) => {

    if (!user) return false;

    const permissions = user.permissions || [];

    // Super Admin
    if (permissions.includes("*")) {
        return true;
    }

    return permissions.includes(permission);
};