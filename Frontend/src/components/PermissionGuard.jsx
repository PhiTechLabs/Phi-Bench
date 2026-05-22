// import { hasPermission } from "../utils/permissions";
// import {getCurrentUser} from "../utils/auth";
// const PermissionGuard = ({
//     permission,
//     children,
//     fallback = null,
// }) => {

//     const user = getCurrentUser();

//     if (!permission) return children;

//     const allowed = hasPermission(user, permission);

//     if (!allowed) return fallback;

//     return children;
// };

// export default PermissionGuard;


import { hasPermission } from "../utils/hasPermission";
import { getCurrentUser } from "../utils/auth";

const PermissionGuard = ({
    permission,
    children,
    fallback = null,
}) => {

    const user = getCurrentUser();

    if (!user) return fallback;

    if (!permission) return children;

    const allowed = hasPermission(user, permission);

    if (!allowed) return fallback;

    return children;
};

export default PermissionGuard;