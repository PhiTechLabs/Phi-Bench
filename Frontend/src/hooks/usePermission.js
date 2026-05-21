import { getCurrentUser } from "../utils/auth";
import { hasPermission } from "../utils/hasPermission";

export default function usePermissions() {
    const user = getCurrentUser();

    return {
        user,
        can: (perm) => hasPermission(user, perm),
    };
}