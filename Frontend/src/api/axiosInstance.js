import axios from "axios";

// ─── CENTRAL AXIOS INSTANCE ───────────────────────────────────────────────────
// All API calls go through this. It automatically:
//   • prefixes URLs with the backend base
//   • sends the auth cookie cross-origin (withCredentials)
//   • sets JSON content-type
const axiosInstance = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

export default axiosInstance;