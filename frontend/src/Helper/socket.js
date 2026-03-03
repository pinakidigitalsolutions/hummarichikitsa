import io from "socket.io-client";
const BASE_URL = "http://localhost:5000";
// const BASE_URL = "https://doctor-appointment-backend-t00j.onrender.com";
const socket = io(BASE_URL);

export default socket