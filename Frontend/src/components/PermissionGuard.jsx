import { getCurrentUser } from "../utils/auth";
import { hasPermission } from "../utils/hasPermission";

const PermissionGuard = ({
    module,
    action,
    children,
    fallback = null,
}) => {

    const user = getCurrentUser();

    if (!user) {
        return fallback;
    }

    if (!module || !action) {
        return children;
    }

    const allowed =
        hasPermission(
            user,
            module,
            action
        );

    if (!allowed) {
        return fallback;
    }

    return children;
};

export default PermissionGuard;