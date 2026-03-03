
import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import axiosInstance from "../Helper/axiosInstance";

const RequireAuth = ({ allowedRoles }) => {
  const location = useLocation();
  const [role, setRole] = useState(null);
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axiosInstance.get("/user/me");

        setRole(response.data.user.role);

      } catch (error) {
          localStorage.removeItem("data");
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("role");
          localStorage.removeItem("token");
          window.location.href = '/';
      }
    }

    fetchData();
  }, []);
  // Still loading role
  if (isLoggedIn && role === null) {
    return <div className=' w-full h-screen flex justify-center bg-gray-900 items-center'>
      <span class="loader"></span>
    </div>;
  }

  return isLoggedIn && allowedRoles.includes(role) ? (
    <Outlet />
  ) : isLoggedIn ? (
    <Navigate to="/denied" state={{ from: location }} replace />
  ) : (
    <Navigate to="/" state={{ from: location }} replace />
  );
};

export default RequireAuth;

