export const hasPermission = (user, permission) => {

    if (!user) return false;

    // Super Admin
    if (
        user.role === "super_admin" ||
        user.role?.name === "super_admin"
    ) {
        return true;
    }

    const modulePermissions = user?.role?.modulePermissions;

    if (!modulePermissions) {
        return false;
    }

    const [module, action] = permission.split(".");

    const permissionMap = {
        create: "add",
        view: "view",
        edit: "edit",
        delete: "delete"
    };

    const actualAction = permissionMap[action] || action;

    const allowed =
        modulePermissions?.[module]?.[actualAction];

    return allowed && allowed !== "none";
};