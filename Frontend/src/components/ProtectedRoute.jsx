import { Navigate } from "react-router-dom";
import { hasPermission } from "../utils/permissions";
import {getCurrentUser} from "../utils/auth";

const ProtectedRoute = ({ children, permission }) => {
    const user = getCurrentUser();

    // Not logged in
    if (!user) {
        return <Navigate to="/" replace />;
    }

    // Permission check
    if (permission && !hasPermission(user, permission)) {
        return <Navigate to="/home" replace />;
    }

    return children;
};

export default ProtectedRoute;