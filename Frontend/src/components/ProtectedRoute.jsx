import { Navigate } from "react-router-dom";
import { hasPermission } from "../utils/permissions";

const ProtectedRoute = ({ children, permission }) => {
    const user = JSON.parse(localStorage.getItem("user"));

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