export const hasPermission = (
    user,
    module,
    action
) => {

    if (!user) return false;

    const role =
        user.role ||
        user.roleId;

    // Super Admin
    if (
        role?.name === "super_admin" ||
        user.role === "super_admin"
    ) {
        return true;
    }

    const modulePermissions =
        user.modulePermissions ||
        role?.modulePermissions;

    if (!modulePermissions) {
        return false;
    }

    const permission =
        modulePermissions?.[module]?.[action];

    return (
        permission &&
        permission !== "none"
    );
};