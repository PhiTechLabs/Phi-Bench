export const canManageRole = (
    currentUserRole,
    targetRole
) => {

    if (!currentUserRole || !targetRole) {
        return false;
    }

    if (
        currentUserRole.name ===
        "super_admin"
    ) {
        return true;
    }

    return (
        currentUserRole.hierarchyLevel <
        targetRole.hierarchyLevel
    );
};