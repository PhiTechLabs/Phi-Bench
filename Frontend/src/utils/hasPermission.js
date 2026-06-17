    export const hasPermission = (
    user,
    module,
    action
    ) => {
    if (!user) return false;

    // support PERMISSIONS.CLIENT_VIEW style objects
    if (
        typeof module === "object" &&
        module !== null
    ) {
        action = module.action;
        module = module.module;
    }

    const role = user.role || user.roleId;

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