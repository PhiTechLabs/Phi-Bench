import { getCurrentUser } from "../utils/auth";
import { hasPermission } from "../utils/hasPermission";

export default function usePermissions() {

    const user = getCurrentUser();

    const can = (module, action) =>
        hasPermission(user, module, action);

    return {
        user,
        can,
        permissions:
            user?.modulePermissions ||
            user?.roleId?.modulePermissions ||
            {},
    };
}