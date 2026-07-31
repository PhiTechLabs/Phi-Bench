import { useNavigate } from "react-router-dom";
import phiBenchLogo from "url:../assets/phiBenchLogo.png"

// Each label maps to the `id` on the section it should scroll to. Reviews/FAQ
// sections exist on the page too, but intentionally have no nav entry — only
// these 4 are ever shown in the navbar.
const NAV_LINKS = [
    { label: "Home", id: "home" },
    { label: "Features", id: "features" },
    { label: "Industries", id: "industries" },
    { label: "Contact", id: "contact" },
];

function Landing_Navbar() {
    const navigate = useNavigate();

    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <nav className="sticky top-0 z-50 w-full h-16 bg-[#1A3989] flex items-center justify-between px-5  md:px-6">

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

                {NAV_LINKS.map((link) => (
                    <button
                        key={link.id}
                        onClick={() => scrollToSection(link.id)}
                        className="text-white text-md font-medium transition-all duration-300 hover:scale-105 cursor-pointer"
                    >
                        {link.label}
                    </button>
                ))}

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