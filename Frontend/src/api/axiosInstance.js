import axios from "axios";

// ─── API BASE URL ─────────────────────────────────────────────────────────────
// Set in a .env file at the project root (NOT committed to git — see
// .env.example). Parcel inlines process.env.* values at build time, reading
// from .env / .env.production / .env.development automatically based on
// whether you ran `parcel` (dev) or `parcel build` (production).
//
// Locally: .env.development with API_BASE_URL=http://localhost:5000/api
//
// On Vercel: set API_BASE_URL to the relative path "/api" (NOT the raw
// Railway URL). vercel.json (project root) rewrites /api/* to the real
// Railway backend server-side, so from the browser's point of view every
// request stays on the Vercel domain — no cross-site request at all.
// That matters because the accessToken/refreshToken cookies the backend
// sets only survive as first-party cookies this way; browsers (Incognito/
// Private windows especially, but increasingly all browsing) block
// third-party cookies outright, which is what made login "work" but the
// very next request come back 401 and bounce you to a blank /login.
//
// The localhost fallback below only matters if no .env file exists at all —
// once you add one, the value there always wins.
const API_BASE_URL =
    process.env.API_BASE_URL || "http://localhost:5000/api";

// ─── CENTRAL AXIOS INSTANCE ───────────────────────────────────────────────────
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── AUTO REFRESH TOKEN INTERCEPTOR ──────────────────────────────────────────
axiosInstance.interceptors.response.use(

    (response) => response,

    async (error) => {

        const originalRequest = error.config;

        // access token expired
        if (
            error.response?.status === 401 &&
            !originalRequest._retry
        ) {

            originalRequest._retry = true;

            try {

                // get new access token
                await axios.post(
                    `${API_BASE_URL}/auth/refresh-token`,
                    {},
                    {
                        withCredentials: true,
                    }
                );

                // retry original request
                return axiosInstance(originalRequest);

            } catch (refreshError) {

                // Views are user-scoped (uid_key) so safe to leave — just remove session
                localStorage.removeItem("user");

                // redirect to login
                window.location.href = "/login";

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);



export default axiosInstance;