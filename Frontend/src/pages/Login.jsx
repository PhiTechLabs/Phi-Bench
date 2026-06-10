import React, { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaArrowRight } from "react-icons/fa";
import logo from "url:../assets/phiBenchBlueLogo.png";
import MailIcon from "url:../assets/mailIcon.svg";
import PhoneIcon from "url:../assets/phoneIcon.svg";
import WarningIcon from "url:../assets/WarningIcon.svg";

const loginVideo = new URL("../assets/phiBench-animation.mp4", import.meta.url).href;
const loginVideoWebm = new URL("../assets/phiBench-animation.webm", import.meta.url).href;

const api = axiosInstance;

export default function Login() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showForgotModal, setShowForgotModal] = useState(false);

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
            const res = await api.post("/auth/login", {
                loginId: data.loginId,
                password: data.password,
            });

            const { user } = res.data;
            console.log(res.data);
            console.log(user);

            localStorage.setItem("user", JSON.stringify(user));
            navigate("/home");

        } catch (error) {
            alert(error.response?.data?.message || "Login Failed");
        }
    }

    const ssoCardBase = `
        group relative flex items-center justify-center gap-2
        border border-gray-200 rounded-lg py-2 px-3
        text-sm text-gray-700 font-medium cursor-pointer
        overflow-hidden transition-all duration-300 ease-out
        hover:border-blue-900 hover:text-blue-900 hover:bg-blue-50
        hover:shadow-sm hover:-translate-y-[1px]
    `;

    return (
        <div className="min-h-screen flex bg-gray-100">

            {/* LEFT SIDE — unchanged */}
            <div className="hidden lg:flex relative overflow-hidden w-[60%] bg-[#070683] text-white p-12 items-center justify-center">
                <div className="absolute top-[-20%] left-[-20%] h-125 w-125 rounded-full bg-[#4E4DFF] opacity-70 blur-[90px] animate-float-1"></div>
                <div className="absolute top-[20%] right-[-15%] h-112.5 w-112.5 rounded-full bg-[#0100B5] opacity-70 blur-[100px] animate-float-2"></div>
                <div className="absolute bottom-[-20%] left-[25%] h-137.5 w-137.5 rounded-full bg-[#0605AE] opacity-70 blur-[110px] animate-float-3"></div>
                <div className="absolute top-[35%] left-[40%] h-87.5 w-87.5 rounded-full bg-[#2928BE] opacity-60 blur-[80px] animate-float-4"></div>
                <div className="absolute inset-0 bg-linear-to-br from-white/5 via-transparent to-white/5"></div>
                <div className="relative z-10 flex items-center justify-center w-full h-full">
                    <video autoPlay loop muted playsInline preload="auto" className="w-150 h-150 object-contain">
                        <source src={loginVideoWebm} type="video/webm" />
                        <source src={loginVideo} type="video/mp4" />
                    </video>
                </div>
            </div>

            {/* RIGHT SIDE — LOGIN FORM */}
            <div className="relative flex w-full lg:w-[40%] items-center justify-center bg-white overflow-hidden">

                {/* BLUR OVERLAY — only covers right side */}
                {showForgotModal && (
                    <div className="absolute inset-0 backdrop-blur-sm bg-white/30 z-10" />
                )}

                {/* FORGOT CREDENTIALS MODAL */}
                {showForgotModal && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 px-6">
                        <div className="bg-white rounded-2xl shadow-xl px-8 py-7 w-full max-w-xs text-center">
                            {/* Warning Icon */}
                            <div className="flex justify-center mb-3">
                                <img src={WarningIcon} alt="Warning" className="h-10 w-10" />
                            </div>
                            {/* Title */}
                            <h3 className="text-sm font-semibold text-gray-800 mb-2">
                                Access Restricted
                            </h3>
                            {/* Message */}
                            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                                You are not authorized to use this function,<br />kindly connect Admin
                            </p>
                            {/* Close Button — same hover as Sign In */}
                            <button
                                type="button"
                                onClick={() => setShowForgotModal(false)}
                                className="
                                    group w-full py-2 rounded-lg
                                    text-xs font-medium
                                    flex items-center justify-center
                                    border border-blue-900
                                    bg-blue-900 text-white
                                    hover:bg-taupe-200 hover:text-blue-900
                                    transition-all duration-300 ease-out
                                    hover:shadow-sm hover:-translate-y-px
                                "
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

                {/* FORM CONTENT */}
                <div className="w-full max-w-80">

                    {/* LOGO */}
                    <div className="mb-1.5">
                        <img src={logo} alt="PhiBench Logo" className="h-15 w-auto object-contain" />
                    </div>

                    {/* SUBTITLE */}
                    <p className="text-xs ml-3 text-gray-400 mb-6">Login to your account</p>

                    <form className="space-y-4 pl-2" onSubmit={handleSubmit}>

                        {/* USERNAME / EMAIL */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Username / E-mail
                            </label>
                            <input
                                type="text"
                                name="loginId"
                                placeholder="Enter your username / E-mail"
                                defaultValue={localStorage.getItem("rememberedUser") || ""}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent placeholder-gray-400 transition duration-200"
                            />
                        </div>

                        {/* PASSWORD */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter your password"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent placeholder-gray-400 pr-9 transition duration-200"
                                />
                                <span
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                >
                                    {showPassword ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
                                </span>
                            </div>
                        </div>

                        {/* REMEMBER + FORGOT */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                                <input type="checkbox" name="remember" className="accent-blue-900 w-3 h-3" />
                                Remember me
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowForgotModal(true)}
                                className="text-xs text-blue-900 hover:underline font-medium cursor-pointer transition-opacity duration-200 hover:opacity-70"
                            >
                                Forgot Credentials?
                            </button>
                        </div>

                        {/* SIGN IN BUTTON */}
                        <button
                            type="submit"
                            className="
                                group relative w-full py-2 rounded-lg
                                text-xs font-medium overflow-hidden
                                flex items-center justify-center gap-2
                                border border-blue-900
                                bg-blue-900 text-white
                                hover:bg-taupe-200 hover:text-blue-900
                                transition-all duration-300 ease-out
                                hover:shadow-sm hover:-translate-y-px
                            "
                        >
                            Login
                            <FaArrowRight
                                size={11}
                                className="transition-transform duration-300 group-hover:translate-x-1"
                            />
                        </button>

                    </form>

                    {/* DIVIDER */}
                    <div className="flex items-center gap-2 my-5">
                        <div className="flex-1 h-px bg-gray-200"></div>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">or Login with</span>
                        <div className="flex-1 h-px bg-gray-200"></div>
                    </div>

                    {/* SSO CARDS */}
                    <div className="grid grid-cols-2 gap-3">

                        {/* Google */}
                        <button type="button" className={ssoCardBase}>
                            <svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            Google
                        </button>

                        {/* Microsoft 365 */}
                        <button type="button" className={ssoCardBase}>
                            <svg width="14" height="14" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                                <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
                                <path fill="#f35325" d="M1 1h10v10H1z"/>
                                <path fill="#81bc06" d="M12 1h10v10H12z"/>
                                <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                                <path fill="#ffba08" d="M12 12h10v10H12z"/>
                            </svg>
                            Microsoft 365
                        </button>

                        {/* E-Mail */}
                        <button type="button" className={ssoCardBase}>
                            <img src={MailIcon} alt="Mail" className="w-3.5 h-3.5 shrink-0" />
                            E-mail
                        </button>

                        {/* Phone number */}
                        <button type="button" className={ssoCardBase}>
                            <img src={PhoneIcon} alt="Phone" className="w-3.5 h-3.5 shrink-0" />
                            Phone number
                        </button>

                    </div>

                </div>
            </div>
        </div>
    );
}