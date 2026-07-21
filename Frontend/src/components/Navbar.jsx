import React, { useState, useRef, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
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
import { globalSearch, getSearchResultRoute } from "../api/searchApi";
import useInactivityLogout from "../hooks/useInactivityLogout";

// Small icon per entity type, reusing the same icons already used in the
// nav menu so search results feel visually consistent with the rest of the app.
const RESULT_ICONS = {
  job: <FaBriefcase />,
  candidate: <FaUsers />,
  client: <FaHandshake />,
};

const RESULT_LABELS = {
  job: "Job",
  candidate: "Candidate",
  client: "Client",
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // ─── GLOBAL SEARCH STATE ───────────────────────────────────────────────────
  // This is the navbar's search — it queries the database directly across
  // jobs, candidates, and clients by code (JC/CD/CL) or name. It is NOT the
  // same as each DataTable's own search box, which only filters rows
  // already loaded for that one page.
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const searchBoxRef = useRef(null);
  const debounceRef = useRef(null);

  const dropdownRef = useRef(null);
  const user = getCurrentUser();

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Debounced search — waits 300ms after the user stops typing before
  // hitting the API, so we're not firing a request on every keystroke.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults([]);
      setSearchLoading(false);
      setSearchError(false);
      return;
    }

    setSearchLoading(true);
    setSearchError(false);

    debounceRef.current = setTimeout(async () => {
      try {
        const results = await globalSearch(trimmed);
        setSearchResults(results);
      } catch (err) {
        console.warn("Global search failed:", err?.response?.data || err);
        setSearchError(true);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [searchQuery]);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (_) {}
    // Views and preferences are stored under user-scoped keys (uid_storageKey)
    // so they survive logout and are available when the user logs back in,
    // while remaining invisible to other users who log in on the same device.
    localStorage.removeItem("user");
    navigate("/");
  };

  // Auto-logout after 3 hours with no mouse/keyboard/touch activity anywhere
  // in the app. Navbar wraps every authenticated route (see App.jsx), so
  // mounting the hook here covers the whole app from one place. Reuses the
  // same handleLogout as the manual "Logout" button in the profile drawer.
  useInactivityLogout(handleLogout);

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

// console.log("USER", user);

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
      <nav className="bg-blue-900 text-white h-16 flex items-center px-4 md:px-6 shadow-md fixed top-0 left-0 right-0 z-60">

        <button onClick={() => setMobileOpen(true)} className="md:hidden text-xl mr-3 text-white">
          <FaBars />
        </button>

        <Link
          to="/home"
          className="flex items-center cursor-pointer mr-8 shrink-0 h-full py-0"
        >
          <img src={phiBenchLogo} alt="PhiBench" className="h-full py-2 w-auto object-contain" />
        </Link>

        <div className="hidden md:flex items-center gap-2 flex-1">
          {primaryMenu.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`relative px-5 py-2 text-base font-medium transition-all group
                ${isActive(item.path) ? "text-white" : "text-blue-200 hover:text-white"}`}
            >
              {item.name}
              <span
                className={`absolute left-1/2 -translate-x-1/2 bottom-0 h-0.5 bg-white transition-all duration-300
                  ${isActive(item.path) ? "w-3/4" : "w-0 group-hover:w-3/4"}`}
              />
            </Link>
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
              <div className="absolute top-full mt-2 left-0 bg-white text-gray-800 rounded-xl shadow-xl w-48 py-1.5 z-70 border border-gray-100">
                {filteredSecondaryMenu.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setDropdownOpen(false)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-blue-50 transition
                      ${isActive(item.path) ? "text-blue-700 font-semibold bg-blue-50" : "text-gray-700"}`}
                  >
                    <span className="text-blue-600">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <div className="relative flex items-center" ref={searchBoxRef}>
            {searchOpen && (
              <div className="fixed top-16 right-6 md:right-8 w-80 z-70">
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by code (JC001, CD014, CL003) or name..."
                  className="w-full bg-white text-gray-700 placeholder:text-gray-400 text-sm px-3 py-2 rounded-lg outline-none border border-blue-600 transition-all shadow-lg mt-2"
                />

                {searchQuery.trim() && (
                  <div className="absolute top-full mt-1.5 left-0 right-0 max-h-80 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl">
                    {searchLoading && (
                      <div className="px-4 py-3 text-sm text-gray-400">Searching...</div>
                    )}

                    {!searchLoading && searchError && (
                      <div className="px-4 py-3 text-sm text-red-500">
                        Search failed. Try again.
                      </div>
                    )}

                    {!searchLoading && !searchError && searchResults.length === 0 && (
                      <div className="px-4 py-3 text-sm text-gray-400">
                        No matches for "{searchQuery.trim()}"
                      </div>
                    )}

                    {!searchLoading &&
                      !searchError &&
                      searchResults.map((result) => (
                        <Link
                          key={`${result.entityType}-${result.id}`}
                          to={getSearchResultRoute(result) || "#"}
                          onClick={(e) => {
                            if (!getSearchResultRoute(result)) { e.preventDefault(); return; }
                            setSearchOpen(false);
                            setSearchQuery("");
                            setSearchResults([]);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-blue-50 transition border-b border-gray-50 last:border-0"
                        >
                          <span className="text-blue-600 shrink-0">
                            {RESULT_ICONS[result.entityType]}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-800 truncate">
                                {result.title}
                              </span>
                              {result.code && (
                                <span className="shrink-0 rounded-md bg-blue-50 px-1.5 py-0.5 text-[11px] font-semibold text-blue-700">
                                  {result.code}
                                </span>
                              )}
                            </div>
                            {result.subtitle && (
                              <div className="text-xs text-gray-400 truncate">
                                {RESULT_LABELS[result.entityType]} · {result.subtitle}
                              </div>
                            )}
                          </div>
                        </Link>
                      ))}
                  </div>
                )}
              </div>
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
            <Link
                to="/settings"
                className={`p-2 rounded-lg text-lg transition
                    ${
                        isActive("/settings")
                            ? "bg-blue-700 text-white"
                            : "text-blue-200 hover:bg-blue-800 hover:text-white"
                    }`}
            >
                <FaCog />
            </Link>
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
        <div className="fixed inset-0 bg-black/50 z-65 md:hidden">
          <div className="bg-blue-900 w-56 h-full p-5 text-white relative flex flex-col">
            <button onClick={() => setMobileOpen(false)} className="absolute top-5 right-5 text-2xl">
              <RxCross2 />
            </button>
            <div className="mb-6 mt-1">
              <img src={phiBenchLogo} alt="PhiBench" className="h-10 w-auto object-contain" />
            </div>
            <ul className="space-y-1 flex-1">
              {fullMenu.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition text-sm
                      ${isActive(item.path) ? "bg-blue-700 text-white" : "hover:bg-blue-800 text-blue-100"}`}
                  >
                    <span>{item.icon}</span>
                    {item.name}
                  </Link>
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
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-65"
            onClick={() => setProfileOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-65">
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

              {/* My Account — links to /setup (works for all roles) */}
              <Link
                to="/setup"
                onClick={() => setProfileOpen(false)}
                className="mt-4 block w-full text-center text-sm bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg transition font-medium"
              >
                My Account
              </Link>
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
            <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-75">
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