// PrivateRoute.jsx
import { Navigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token"); // or your auth logic
  const location = useLocation();

  if (!token) {
    // Redirect to login with the current path saved in state
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;
