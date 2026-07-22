import { useNavigate } from "react-router-dom";
import phiBenchLogo from "url:../assets/phiBenchLogo.png"

function Landing_Navbar() {
    const navigate = useNavigate();

    return (
        <nav className="w-full h-16 bg-[#1A3989] flex items-center justify-between px-5  md:px-6">

            {/* Logo */}
            <div className="flex items-center">
                <img
                    src={phiBenchLogo}
                    alt="PhiBench Logo"
                    className="h-12 w-auto object-contain"
                />
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center flex-justify-evenly space-x-18">

                <button
                    className="text-white text-md font-medium transition-all duration-300 hover:scale-105 cursor-pointer"
                >
                    Home
                </button>

                <button
                    className="text-white text-md font-medium transition-all duration-300 hover:scale-105 cursor-pointer"
                >
                    Features
                </button>

                <button
                    className="text-white text-md font-medium transition-all duration-300 hover:scale-105 cursor-pointer"
                >
                    Industries
                </button>

                <button
                    className="text-white text-md font-medium transition-all duration-300 hover:scale-105 cursor-pointer"
                >
                    Contact
                </button>

            </div>

{/* Login Button */}
            <button
                onClick={() => navigate("/login")}
                className="
                    bg-[#3153A0]
                    text-white
                    px-9
                    py-2
                    rounded-full
                    text-md
                    font-medium
                    transition-all
                    duration-300
                    hover:bg-white
                    hover:text-[#1A3989]
                    hover:scale-105
                    cursor-pointer
                "
            >
                Login
            </button>

        </nav>
    );
}

export default Landing_Navbar;