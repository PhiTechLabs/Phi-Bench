import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  
  // If no user is logged in, redirect to login page
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  // If user is logged in, show the protected content
  return children;
};

export default ProtectedRoute;
