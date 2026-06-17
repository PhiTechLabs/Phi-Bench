import { useCallback, useMemo } from "react";
import { getCurrentUser } from "../utils/auth";
import { hasPermission } from "../utils/hasPermission";

export default function usePermissions() {
    const user = getCurrentUser();

    const can = useCallback(
        (module, action) => {
            return hasPermission(user, module, action);
        },
        [user]
    );

    return useMemo(
        () => ({
            user,
            can,
            permissions:
                user?.modulePermissions ||
                user?.roleId?.modulePermissions ||
                {},
        }),
        [user, can]
    );
}