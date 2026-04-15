    import React, { useState } from "react";
    import { Link, useLocation } from "react-router-dom";
    import { FaUserCircle, FaBars, FaTimes } from "react-icons/fa";

    const Navbar = () => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const linkClass = (path) =>
        `block px-3 py-2 rounded-md transition ${
        location.pathname === path
            ? "bg-white text-blue-700"
            : "hover:bg-blue-600"
        }`;

    return (
        <nav className="bg-blue-700 text-white px-6 py-3 shadow-md relative">

        <div className="flex justify-between items-center">

            {/* Logo */}
            <div className="text-xl font-semibold tracking-wide">
            Phi-Bench
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex gap-3 text-sm font-medium items-center">
            <Link to="/home" className={linkClass("/home")}>Home</Link>
            <Link to="/client" className={linkClass("/client")}>Clients</Link>
            <Link to="/jobs" className={linkClass("/jobs")}>Jobs</Link>
            <Link to="/candidates" className={linkClass("/candidates")}>Candidates</Link>
            <Link to="/interviews" className={linkClass("/interviews")}>Interviews</Link>
            

            <FaUserCircle className="text-2xl ml-4 cursor-pointer" />
            </div>

            {/* Mobile Icons */}
            <div className="flex items-center gap-4 md:hidden">
            <FaUserCircle className="text-2xl cursor-pointer" />

            {/* Hamburger */}
            <button onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
            </button>
            </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
            <div className="md:hidden mt-4 bg-blue-800 rounded-lg p-4 space-y-2">

            <Link to="/home" onClick={() => setIsOpen(false)} className={linkClass("/home")}>
                Home
            </Link>

            <Link to="/jobs" onClick={() => setIsOpen(false)} className={linkClass("/jobs")}>
                Jobs
            </Link>

            <Link to="/candidates" onClick={() => setIsOpen(false)} className={linkClass("/candidates")}>
                Candidates
            </Link>

            <Link to="/interviews" onClick={() => setIsOpen(false)} className={linkClass("/interviews")}>
                Interviews
            </Link>

            <Link to="/clients" onClick={() => setIsOpen(false)} className={linkClass("/clients")}>
                Clients
            </Link>

            </div>
        )}
        </nav>
    );
    };

    export default Navbar;