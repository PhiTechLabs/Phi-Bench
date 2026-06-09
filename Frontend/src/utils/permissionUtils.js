export const canViewModule = (user, module) => {
    const access =
        user?.role?.modulePermissions?.[module]?.view;

    return access && access !== "none";
};