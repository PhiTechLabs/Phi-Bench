import axios from "axios";

// ─── CENTRAL AXIOS INSTANCE ───────────────────────────────────────────────────
const axiosInstance = axios.create({
    // baseURL: "http://localhost:5000/api",
    baseURL: "http://localhost:5000/api",
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
                    // `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
                    `http://localhost:5000/api/auth/refresh-token`,
                    {},
                    {
                        withCredentials: true,
                    }
                );

                // retry original request
                return axiosInstance(originalRequest);

            } catch (refreshError) {

                localStorage.clear();

                // console.error("Session expired");

                // redirect to login
                window.location.href = "/login";

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);



export default axiosInstance;