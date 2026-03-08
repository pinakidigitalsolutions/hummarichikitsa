
import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import axiosInstance from "../Helper/axiosInstance";

const RequireAuth = ({ allowedRoles }) => {
  const location = useLocation();
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const cachedRole = localStorage.getItem("role");
  const [role, setRole] = useState(cachedRole);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axiosInstance.get("/user/me");
        const fetchedRole = response.data.user.role;
        setRole(fetchedRole);
        localStorage.setItem("role", fetchedRole);
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

  // Only show loader if logged in but no cached role available
  // if (isLoggedIn && role === null) {
  //   return <div className=' w-full h-screen flex justify-center bg-gray-900 items-center'>
  //     <span className="loader"></span>
  //   </div>;
  // }

  return isLoggedIn && allowedRoles.includes(role) ? (
    <Outlet />
  ) : isLoggedIn ? (
    <Navigate to="/denied" state={{ from: location }} replace />
  ) : (
    <Navigate to="/" state={{ from: location }} replace />
  );
};

export default RequireAuth;
