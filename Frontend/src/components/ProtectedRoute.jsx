import { Navigate } from "react-router-dom";
import { hasPermission } from "../utils/permissions";

const ProtectedRoute = ({ permission, children }) => {

    if (!hasPermission(permission)) {
        return <Navigate to="/unauthorized" />;
    }

    return children;
};

export default ProtectedRoute;