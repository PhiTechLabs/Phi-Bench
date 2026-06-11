import React, { useState, useRef, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import {
  FaTachometerAlt,
  FaUsers,
  FaBriefcase,
  FaUserTie,
  FaHandshake,
  FaChartBar,
  FaCog,
  FaPaperPlane,
  FaBuilding,
  FaPlus,
  FaSearch,
  FaBars,
} from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { MdPeopleAlt } from "react-icons/md";

import favIcon from "url:../assets/favIcon.png";
import phiBenchLogo from "url:../assets/phiBenchLogo.png"; 

import {hasPermission} from "../utils/hasPermission";

import { getCurrentUser } from "../utils/auth";
import { PERMISSIONS } from "../pages/settings/constants/permissions";

// withCredentials so the logout call also sends the HttpOnly cookie
const api = axiosInstance.create({
  baseURL: "http://localhost:5000/api/auth",
  withCredentials: true,
});

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const dropdownRef = useRef(null);
  const user = getCurrentUser();

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    try {
      // Tell backend to clear the HttpOnly cookie
      await api.post("/logout");
    } catch (_) {
      // even if request fails, clear local state
    }
    localStorage.clear();
    navigate("/");
  };

  // My Account — navigate to /setup (works for all roles)
  const handleMyAccount = () => {
    setProfileOpen(false);
    navigate("/setup");
  };

  const allPrimaryMenu = [
  {
    name: "Home",
    path: "/home",
    icon: <FaTachometerAlt />
  },

  {
    name: "Bench",
    path: "/bench",
    icon: <MdPeopleAlt />,
    permission: PERMISSIONS.BENCH_VIEW
  },

  {
    name: "Jobs",
    path: "/jobs",
    icon: <FaBriefcase />,
    permission: PERMISSIONS.JOB_VIEW
  },

  {
      name: "Submissions",
      path: "/submissions",
      icon: <FaPaperPlane />,
      permission: PERMISSIONS.SUBMISSION_VIEW
  },

  {
      name: "Interviews",
      path: "/interviews",
      icon: <FaUserTie />,
      permission: PERMISSIONS.INTERVIEW_VIEW
  },

  

  
];

console.log("USER", user);

  const primaryMenu = allPrimaryMenu.filter(item => {
    if (!item.permission) return true;

    return hasPermission(
        user,
        item.permission.module,
        item.permission.action
    );
});

  const secondaryMenu = [

  {
    name: "Candidates",
    path: "/candidates",
    icon: <FaUsers />,
    permission: PERMISSIONS.CANDIDATE_VIEW
  },

      {
          name: "Clients",
          path: "/client-list",
          icon: <FaHandshake />,
          permission: PERMISSIONS.CLIENT_VIEW
      },

      {
          name: "Reports",
          path: "/reports",
          icon: <FaChartBar />,
          permission: PERMISSIONS.REPORT_VIEW
      },
  ];

    const filteredSecondaryMenu = secondaryMenu.filter(item => {
        if (!item.permission) return true;
        return hasPermission(
            user,
            item.permission.module,
            item.permission.action
        );
    });

  const fullMenu = [...primaryMenu, ...filteredSecondaryMenu];
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">

      {/* ── TOP NAVBAR ── */}
      <nav className="bg-blue-900 text-white h-16 flex items-center px-4 md:px-6 shadow-md fixed top-0 left-0 right-0 z-[70]">

        <button onClick={() => setMobileOpen(true)} className="md:hidden text-xl mr-3 text-white">
          <FaBars />
        </button>

        <div
          onClick={() => navigate("/home")}
          className="flex items-center cursor-pointer mr-8 shrink-0 h-full py-0"
        >
          <img src={phiBenchLogo} alt="PhiBench" className="h-full py-2 w-auto object-contain" />
        </div>

        <div className="hidden md:flex items-center gap-2 flex-1">
          {primaryMenu.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`relative px-5 py-2 text-base font-medium transition-all group
                ${isActive(item.path) ? "text-white" : "text-blue-200 hover:text-white"}`}
            >
              {item.name}
              <span
                className={`absolute left-1/2 -translate-x-1/2 bottom-0 h-0.5 bg-white transition-all duration-300
                  ${isActive(item.path) ? "w-3/4" : "w-0 group-hover:w-3/4"}`}
              />
            </button>
          ))}

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((p) => !p)}
              className={`relative flex items-center gap-1.5 px-5 py-2 text-base font-medium transition-all group
                ${dropdownOpen ? "text-white" : "text-blue-200 hover:text-white "}`}
            >
              <FaPlus className="text-xs" />
              More
              <span
                className={`absolute left-1/2 -translate-x-1/2 bottom-0 h-0.5 bg-white transition-all duration-300
                  ${dropdownOpen ? "w-3/4" : "w-0 group-hover:w-3/4"}`}
              />
            </button>

            {dropdownOpen && (
  <div className="absolute top-full mt-2 left-0 bg-white text-gray-800 rounded-xl shadow-xl w-48 py-1.5 z-[80] border border-gray-100">
                {filteredSecondaryMenu.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => { navigate(item.path); setDropdownOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-blue-50 transition
                      ${isActive(item.path) ? "text-blue-700 font-semibold bg-blue-50" : "text-gray-700"}`}
                  >
                    <span className="text-blue-600">{item.icon}</span>
                    {item.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <div className="relative flex items-center">
            {searchOpen && (
              <input
                autoFocus
                type="text"
                placeholder="Search..."
                onBlur={() => setSearchOpen(false)}
                className="absolute right-8 w-48 bg-white text-gray-700 placeholder:text-gray-800 text-sm px-3 py-1.5 rounded-lg outline-none border border-blue-600 transition-all"
              />
            )}
            <button
              onClick={() => setSearchOpen((p) => !p)}
              className="p-2 rounded-lg text-blue-200 hover:bg-blue-800 hover:text-white transition text-lg"
            >
              <FaSearch />
            </button>
          </div>

          {hasPermission(
            user,
            PERMISSIONS.SETTINGS_VIEW.module,
            PERMISSIONS.SETTINGS_VIEW.action
        ) && (
            <button
                onClick={() => navigate("/settings")}
                className={`p-2 rounded-lg text-lg transition
                    ${
                        isActive("/settings")
                            ? "bg-blue-700 text-white"
                            : "text-blue-200 hover:bg-blue-800 hover:text-white"
                    }`}
            >
                <FaCog />
            </button>
        )}

          <button
            onClick={() => setProfileOpen(true)}
            className="ml-1 w-9 h-9 rounded-full bg-white text-blue-700 font-bold flex items-center justify-center hover:ring-2 hover:ring-blue-400 transition text-sm"
          >
            {user?.username?.charAt(0)?.toUpperCase()}
          </button>
        </div>
      </nav>

      {/* ── MOBILE SIDEBAR ── */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 md:hidden">
          <div className="bg-blue-900 w-56 h-full p-5 text-white relative flex flex-col">
            <button onClick={() => setMobileOpen(false)} className="absolute top-5 right-5 text-2xl">
              <RxCross2 />
            </button>
            <div className="mb-6 mt-1">
              <img src={phiBenchLogo} alt="PhiBench" className="h-10 w-auto object-contain" />
            </div>
            <ul className="space-y-1 flex-1">
              {fullMenu.map((item) => (
                <li
                  key={item.name}
                  onClick={() => { navigate(item.path); setMobileOpen(false); }}
                  className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition text-sm
                    ${isActive(item.path) ? "bg-blue-700 text-white" : "hover:bg-blue-800 text-blue-100"}`}
                >
                  <span>{item.icon}</span>
                  {item.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── PROFILE DRAWER ── */}
      {profileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={() => setProfileOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50">
            <div className="bg-blue-900 text-white p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Profile</h2>
                <button onClick={() => setProfileOpen(false)}>
                  <RxCross2 className="text-2xl" />
                </button>
              </div>
              <div className="mt-6 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white text-blue-600 flex items-center justify-center text-xl font-bold shadow-md">
                  {user?.username?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-lg">{user?.username}</p>
                  <p className="text-sm opacity-80 capitalize">
                    {user?.roleId?.name || user?.role}
                </p>
                </div>
              </div>

              {/* ✅ My Account button — now navigates to /setup */}
              <button
                onClick={handleMyAccount}
                className="mt-4 w-full text-sm bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg transition font-medium"
              >
                My Account
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
                <p className="text-sm text-gray-500">Username</p>
                <p className="font-medium text-gray-800">{user?.username}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-medium text-gray-800 capitalize">{user?.roleId?.name || user?.role}</p>
              </div>
              <div className="border-t pt-4" />
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>

          {showLogoutConfirm && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
              <div className="bg-white rounded-xl shadow-xl p-6 w-72 text-center">
                <h3 className="text-md font-semibold mb-4">Are you sure you want to logout?</h3>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    No
                  </button>
                  <button
                    onClick={() => {
                      setShowLogoutConfirm(false);
                      setProfileOpen(false);
                      handleLogout();
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Yes
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="pt-16 flex-1">
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Navbar;