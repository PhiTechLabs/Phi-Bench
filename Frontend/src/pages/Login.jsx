import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

// ✅ withCredentials: true — tells axios to send/receive cookies
const api = axios.create({
    baseURL: "http://localhost:5000/api/auth",
    withCredentials: true,
});

export default function Login() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        if (data.remember) {
            localStorage.setItem("rememberedUser", data.username);
        } else {
            localStorage.removeItem("rememberedUser");
        }

        try {
            const res = await api.post("/login", {
                username: data.username,
                password: data.password,
            });

            const { user } = res.data;

            // ✅ Cookie is set automatically by the browser (HttpOnly)
            // ✅ Only store non-sensitive UI info in localStorage
            localStorage.setItem("user", JSON.stringify(user));

            // Redirect based on role
            navigate(`/${user.role === "superAdmin" ? "superadmin" : user.role}/home`);

        } catch (error) {
            alert(error.response?.data?.message || "Login Failed");
        }
    }

    return (
        <div className="min-h-screen flex bg-gray-100">

            {/* LEFT SIDE */}
            <div className="hidden lg:flex w-1/2 bg-linear-to-br from-blue-900 to-blue-600 text-white p-12 items-center">
                <div>
                    <h1 className="text-4xl font-bold mb-4">Welcome to Phi Bench</h1>
                    <p className="text-lg opacity-80">Manage your recruitment pipeline with ease.</p>
                </div>
            </div>

            {/* RIGHT SIDE — LOGIN FORM */}
            <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
                <div className="w-full max-w-sm bg-white shadow-xl rounded-2xl p-10">

                    <div className="flex justify-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800">Phi Bench</h2>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>

                        {/* USERNAME */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
                            <input
                                type="text"
                                name="username"
                                placeholder="Enter your username"
                                defaultValue={localStorage.getItem("rememberedUser") || ""}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* PASSWORD */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter your password"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                                />
                                <span
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                        </div>

                        {/* REMEMBER + FORGOT */}
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 text-gray-600">
                                <input type="checkbox" name="remember" className="accent-blue-600" />
                                Remember me
                            </label>
                            <button type="button" className="text-blue-600 hover:underline">
                                Forgot Credentials?
                            </button>
                        </div>

                        {/* SUBMIT */}
                        <button
                            type="submit"
                            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-lg transition duration-200"
                        >
                            Sign In
                        </button>

                        <p className="text-sm text-center text-gray-600 mt-2">
                            Unable to Login?{" "}
                            <button type="button" className="text-blue-600 hover:underline">
                                Get Help
                            </button>
                        </p>

                    </form>
                </div>
            </div>
        </div>
    );
}