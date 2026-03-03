import React from "react";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 py-12">
      <div className="text-center">
        <h1 className="text-7xl font-extrabold text-indigo-600">404</h1>
        <h2 className="mt-4 text-3xl font-semibold text-gray-800">Page Not Found</h2>
        <p className="mt-2 text-gray-600">
          Sorry, the page you’re looking for doesn’t exist or has been moved.
        </p>
        <a
          href="/"
          className="mt-6 inline-block px-6 py-3 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-500 transition"
        >
          Go back home
        </a>
      </div>
      {/* <div className="mt-10">
        <img
          src="https://illustrations.popsy.co/gray/error-404.png"
          alt="Not found illustration"
          className="w-64 mx-auto"
        />
      </div> */}
    </div>
  );
}
