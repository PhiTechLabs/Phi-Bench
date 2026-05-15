export const hasPermission = (permission) => {

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) return false;

    const permissions = user.permissions || [];

    return (
        permissions.includes("*") ||
        permissions.includes(permission)
    );
};