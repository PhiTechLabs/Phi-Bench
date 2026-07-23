import { Navigate } from "react-router-dom";
import usePermissions from "../hooks/usePermission";

export default function ProtectedRoute({
    permission,
    children,
}) {

    // console.log("ROUTE PERMISSION:", permission);

    // console.log("ProtectedRoute Props =>", {
    //     permission,
    //     children
    // });
    const { can, user } = usePermissions();

    // console.log("USER:", user);

// fix(auth): prevent ProtectedRoute from crashing when permission prop is omitted
    if (!permission) return children;

const result = can(permission.module, permission.action);
    // console.log(
    //     "CHECK:",
    //     permission.module,
    //     permission.action,
    //     result
    // );

    if (!result) {
        return (
            <Navigate
                to="/unauthorized"
                replace
            />
        );
    }

    return children;
}