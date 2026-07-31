import { Navigate } from "react-router-dom";
import usePermissions from "../hooks/usePermission";

export default function ProtectedRoute({
    permission,
    children,
}) {

    const { can, user } = usePermissions();


// fix(auth): prevent ProtectedRoute from crashing when permission prop is omitted
    if (!permission) return children;

const result = can(permission.module, permission.action);

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