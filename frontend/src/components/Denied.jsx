import React from "react";
import { useNavigate } from "react-router-dom";

const Denied = () => {
  const navigate = useNavigate();
  return (
     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 py-12">
      <div className="text-center">
        <h1 className="text-7xl font-extrabold text-red-600">403</h1>
        <h2 className="mt-4 text-3xl font-semibold text-gray-800">Access Forbidden</h2>
        <p className="mt-2 text-gray-600">
          Sorry, you don’t have permission to access this page.
        </p>
        <a
          href="/"
          className="mt-6 inline-block px-6 py-3 bg-red-600 text-white rounded-md shadow hover:bg-red-500 transition"
        >
          Go back home
        </a>
      </div>
      {/* <div className="mt-10">
        <img
          src="/403-forbidden.png" // Place your forbidden illustration in public or use any relevant image URL
          alt="Forbidden illustration"
          className="w-64 mx-auto"
        />
      </div> */}
    </div>
  );
};

export default Denied;
