import { getCurrentUser } from "../utils/auth";
import { hasPermission } from "../utils/permissions";

export default function usePermissions() {
    const user = getCurrentUser();

    return {
        user,
        can: (perm) => hasPermission(user, perm),
    };
}