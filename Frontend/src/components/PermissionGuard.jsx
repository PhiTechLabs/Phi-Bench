import { getCurrentUser } from "../utils/auth";
import { hasPermission } from "../utils/hasPermission";

const PermissionGuard = ({
    permission,
    module,
    action,
    children,
    fallback = null,
    }) => {
    const user = getCurrentUser();

    if (!user) return fallback;

    const mod = permission?.module || module;
    const act = permission?.action || action;

    if (!mod || !act) return children;

    const allowed = hasPermission(
        user,
        mod,
        act
    );

    return allowed ? children : fallback;
    };

export default PermissionGuard;


