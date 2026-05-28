export const canManageRole = (
    currentUserRole,
    targetRole
) => {

    if (!currentUserRole || !targetRole) {
        return false;
    }

    // SUPER ADMIN BYPASS
    if (
        currentUserRole.permissions?.includes("*")
    ) {
        return true;
    }

    return (
        currentUserRole.hierarchyLevel <
        targetRole.hierarchyLevel
    );
};