const baseURL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000" // Backend URL local
    : "https://chovora-backend.onrender.com"; // Prod Backend URL

const FRONTEND_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5173" // Frontend URL local
    : "https://chovora-frontend.vercel.app"; // Prod Frontend URL

export { baseURL, FRONTEND_URL };
