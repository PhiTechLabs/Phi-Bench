    // pages/Login.jsx
    import React from "react";

    export default function Login() {

        function handleSubmit(formData) {
            const data = Object.fromEntries(formData);

            // Remember Me functionality (frontend only)
            if (data.remember) {
                localStorage.setItem("rememberedUser", data.username);
            } else {
                localStorage.removeItem("rememberedUser");
            }

            console.log(data);
        }

    return (
        <div
        className="min-h-screen flex bg-gray-100"
        >

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
                action={handleSubmit}
            >

                {/* USERNAME */}
                <div>
                <label
                    className="block text-sm font-medium text-gray-600 mb-1"
                >
                    Username
                </label>

                <input
                    type="text"
                    placeholder="Enter your username"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="username"
                />
                </div>


                {/* PASSWORD */}
                <div>
                <label
                    className="block text-sm font-medium text-gray-600 mb-1"
                >
                    Password
                </label>

                <input
                    type="password"
                    placeholder="Enter your password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="password"
                />
                </div>

                {/* REMEMBER + FORGOT */}
                <div className="flex items-center justify-between text-sm">
                    
                    <label className="flex items-center gap-2 text-gray-600">
                        <input
                            type="checkbox"
                            name="remember"
                            className="accent-blue-600"
                        />
                        Remember me
                    </label>

                    <button
                        type="button"
                        className="text-blue-600 hover:underline"
                        onClick={() => {
                            console.log("Forgot Credentials clicked");
                        }}
                    >
                        Forgot Credentials?
                    </button>

                </div>

                {/* BUTTON */}
                <button
                type="submit"
                className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-lg transition duration-200"
                >
                Sign In
                </button>

                <p className="text-sm text-center text-gray-600 mt-2">
                Unable to Login?{" "}
                <button
                    type="button"
                    className="text-blue-600 hover:underline"
                    onClick={() => {
                        console.log("Unable to login clicked");
                    }}
                >
                    Get Help
                </button>
                </p>

            </form>

            </div>
        </div>

        </div>
    );
    }
