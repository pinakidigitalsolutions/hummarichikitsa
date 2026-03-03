
import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import axiosInstance from "../Helper/axiosInstance";

const RequireAuth = ({ allowedRoles }) => {
    const location = useLocation();
    // const [role, setRole] = useState(null);
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const role = localStorage.getItem("role");

    if (isLoggedIn && role === null) {
        return <div className=' w-full h-screen flex justify-center bg-gray-900 items-center'>
            <span class="loader"></span>
        </div>;
    }

    return allowedRoles.includes(role) ? (
        <Navigate to="/doctor/dashboard" state={{ from: location }} replace />

    ) : (<Outlet />)
};

export default RequireAuth;

