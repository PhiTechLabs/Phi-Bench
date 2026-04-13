<<<<<<< HEAD
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();

    function handleSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        // Remember Me
        if (data.remember) {
            localStorage.setItem("rememberedUser", data.username);
        } else {
            localStorage.removeItem("rememberedUser");
        }
=======
    // pages/Login.jsx
    import React from "react";
    import axios from "axios";
    import { useNavigate } from "react-router-dom";

    export default function Login() {
        const navigate = useNavigate();

        async function handleSubmit(formData) {
        const data = Object.fromEntries(formData);

        // Remember Me functionality (frontend only)
        if (data.remember) {
            localStorage.setItem("rememberedUser", data.username);
        } else {
            localStorage.removeItem("rememberedUser");
        }

        try {
            const res = await axios.post("http://localhost:5000/api/auth/login", {
                username: data.username,
                password: data.password
            });

            const { token, user } = res.data;

            // Store token
            localStorage.setItem("token", token);

            // Redirect based on role
            if (user.role === "superAdmin") {
                navigate("/superadmin");
            } else if (user.role === "admin") {
                navigate("/admin");
            } else {
                navigate("/client");
            }

        } catch (error) {
    console.log(error.response?.data);
    alert(error.response?.data?.message || "Login Failed");
}
    }
>>>>>>> 25d71be73720b4c9ba78ab485da5b00170ff4ca9

        console.log(data);

        // 👉 Redirect after login
        navigate("/home");
    }

    return (
        <div className="min-h-screen flex bg-gray-100">

<<<<<<< HEAD
            {/* LEFT SIDE */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-900 to-blue-600 text-white p-12 items-center">
=======
        {/* LEFT SIDE - FUTURE CONTENT AREA */}
        <div
            className="hidden lg:flex w-1/2 bg-linear-to-br from-blue-900 to-blue-600 text-white p-12 items-center"
        >
            <div>
            <h1
                className="text-4xl font-bold mb-4"
            >
                Welcome to Phi Bench
            </h1>

            <p
                className="text-lg opacity-80"
            >
                {/* Future content goes here */}
                {/* You can add illustrations, text, or branding content */}
            </p>
            </div>
        </div>


        {/* RIGHT SIDE - LOGIN FORM */}
        <div
            className="flex w-full lg:w-1/2 items-center justify-center p-8"
        >
            <div
            className="w-full max-w-sm bg-white shadow-xl rounded-2xl p-10"
            >

            {/* LOGO AREA */}
            <div
                className="flex justify-center mb-6"
            >
                {/*
                Uncomment and replace src with your logo path
                <img
                    src="/path-to-logo.png"
                    alt="Phi Bench Logo"
                    className="h-12"
                />
                */}

                <h2
                className="text-2xl font-semibold text-gray-800"
                >
                Phi Bench
                </h2>
            </div>


            {/* FORM */}
            <form
                className="space-y-5"
                onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    handleSubmit(formData);
                }}
            >

                {/* USERNAME */}
>>>>>>> 25d71be73720b4c9ba78ab485da5b00170ff4ca9
                <div>
                    <h1 className="text-4xl font-bold mb-4">
                        Welcome to PhiJobs
                    </h1>
                    <p className="text-lg opacity-80">
                        Your recruitment partner 
                    </p>
                </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
                <div className="w-full max-w-sm bg-white shadow-xl rounded-2xl p-10">

                    {/* LOGO */}
                    <div className="flex justify-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800">
                            PhiJobs
                        </h2>
                    </div>

                    {/* FORM */}
                    <form className="space-y-5" onSubmit={handleSubmit}>

                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Username
                            </label>
                            <input
                                type="text"
                                name="username"
                                placeholder="Enter your username"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Remember */}
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 text-gray-600">
                                <input type="checkbox" name="remember" />
                                Remember me
                            </label>

                            <button
                                type="button"
                                className="text-blue-600 hover:underline"
                            >
                                Forgot?
                            </button>
                        </div>

                        {/* Button */}
                        <button
                            type="submit"
                            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-lg"
                        >
                            Sign In
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
}