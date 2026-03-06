export const SOCKET_URL = window.location.hostname === "localhost" 
  ? "http://localhost:5000" 
  : "https://hummarichikitsa.onrender.com";

export const BASE_URL = `${SOCKET_URL}/api/v1`;
