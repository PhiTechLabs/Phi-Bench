    import { useState } from "react";
    import { useNavigate } from "react-router-dom";
    import BackButton from "../../reusable/BackButton";

    // ============================================================
    // SETTINGS CONFIGURATION
    // ─ To add a section  → push a new object to SETTINGS_SECTIONS
    // ─ To add an item    → push into the section's items[]
    // ─ badge             → optional string shown as a pill
    // ─ route             → react-router path to navigate to
    // ============================================================

    const SETTINGS_SECTIONS = [
    {
        id: "general",
        label: "General",
        items: [
        { id: "personal",      label: "Personal Settings",    route: "personal" },
        { id: "company",       label: "Company Details",      route: "company" },
        { id: "email",         label: "Email Settings",       route: "email" },
        { id: "notifications", label: "Notification Settings",route: "notifications" },
        ],
    },
    {
        id: "users",
        label: "Users & Control",
        items: [
        { id: "users",         label: "Users",            route: "users" },
        { id: "security",      label: "Security Control", route: "security" },
        { id: "roles",         label: "Roles",            route: "roles" },
        { id: "permissions",   label: "Permissions",      route: "permissions" },
        ],
    },
    // {
    //     id: "customization",
    //     label: "Customization",
    //     items: [
    //     { id: "modules",   label: "Modules",             route: "modules" },
    //     { id: "templates", label: "Templates",           route: "templates" },
    //     { id: "pipeline",  label: "Hiring Pipeline",     route: "pipeline" },
    //     { id: "homepage",  label: "Customize Home Page", route: "homepage" },
    //     ],
    // },
    // {
    //     id: "portal",
    //     label: "Portal Setup",
    //     items: [
    //     { id: "portal",        label: "Portal",        route: "portal" },
    //     { id: "client-portal", label: "Client Portal", route: "client-portal" },
    //     ],
    // },
    // {
    //     id: "career",
    //     label: "Career Website",
    //     items: [
    //     { id: "career-site", label: "Career Site", route: "career-site" },
    //     { id: "webforms",    label: "Webforms",    route: "webforms" },
    //     ],
    // },
    // {
    //     id: "jobboard",
    //     label: "Job Board Hub",
    //     items: [
    //     { id: "job-boards",  label: "Job Boards",  route: "job-boards" },
    //     { id: "quick-apply", label: "Quick Apply", route: "quick-apply" },
    //     ],
    // },
    // {
    //     id: "marketplace",
    //     label: "Marketplace",
    //     items: [
    //     { id: "google",    label: "Google",    route: "google" },
    //     { id: "microsoft", label: "Microsoft", route: "microsoft" },
    //     { id: "zapier",    label: "Zapier",    route: "zapier" },
    //     ],
    // },
    // {
    //     id: "data",
    //     label: "Data Administration",
    //     items: [
    //     { id: "migration", label: "Data Migration", route: "migration" },
    //     { id: "export",    label: "Export",          route: "export" },
    //     { id: "storage",   label: "Storage",         route: "storage", badge: "Pro" },
    //     { id: "recycle",   label: "Recycle Bin",     route: "recycle" },
    //     { id: "activity",  label: "Activity Log",    route: "activity" },
    //     ],
    // },
    // {
    //     id: "developer",
    //     label: "Developer Space",
    //     items: [
    //     { id: "apis", label: "APIs", route: "apis" },
    //     ],
    // },
    // {
    //     id: "telephony",
    //     label: "Telephony",
    //     items: [
    //     { id: "messaging", label: "Instant Messaging", route: "messaging", badge: "Pro" },
    //     { id: "mobile",    label: "Mobile Apps",       route: "mobile" },
    //     ],
    // },
    // {
    //     id: "compliance",
    //     label: "Compliance",
    //     items: [
    //     { id: "gdpr",       label: "GDPR",           route: "gdpr" },
    //     { id: "processors", label: "Sub Processors", route: "sub-processors" },
    //     ],
    // },
    // {
    //     id: "zia",
    //     label: "Zia AI",
    //     items: [
    //     { id: "chatbot",            label: "Chatbot",               route: "chatbot" },
    //     { id: "ai-assist",          label: "AI Assist",             route: "assist",             badge: "Pro" },
    //     { id: "profile-summary",    label: "Profile Summary",       route: "profile-summary",    badge: "Pro" },
    //     { id: "interview-insights", label: "AI Interview Insights", route: "interview-insights", badge: "Pro" },
    //     ],
    // },
    ];

    // ============================================================
    // STATS — auto-computed, always in sync with config above
    // ============================================================

    // const STATS = [
    // {
    //     label: "Categories",
    //     value: SETTINGS_SECTIONS.length,
    // },
    // {
    //     label: "Total Settings",
    //     value: SETTINGS_SECTIONS.reduce((sum, s) => sum + s.items.length, 0),
    // },
    // {
    //     label: "Pro Features",
    //     value: SETTINGS_SECTIONS.reduce(
    //     (sum, s) => sum + s.items.filter((i) => i.badge === "Pro").length,
    //     0
    //     ),
    // },
    // ];

    // ============================================================
    // MAIN COMPONENT
    // ============================================================

    export default function Settings() {
    const navigate = useNavigate();

    const [search,   setSearch]   = useState("");
    const [activeId, setActiveId] = useState(null);

    // Filter sections + items based on search query
    const visibleSections = search.trim()
        ? SETTINGS_SECTIONS
            .map((section) => ({
            ...section,
            items: section.items.filter((item) =>
                item.label.toLowerCase().includes(search.toLowerCase())
            ),
            }))
            .filter((section) => section.items.length > 0)
        : SETTINGS_SECTIONS;

    // Navigate on click — add permission checks / API calls here if needed
    const handleItemClick = (item) => {
        setActiveId(item.id);
        navigate(`/settings/${item.route}`);
    };

    return (
        <div className="min-h-screen bg-slate-50 px-6 py-10">

        {/* Page Header */}
        <PageHeader
            search={search}
            onSearchChange={(e) => setSearch(e.target.value)}
            onClearSearch={() => setSearch("")}
        />


        {/* Cards Grid */}
        {visibleSections.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {visibleSections.map((section) => (
                <SettingsCard
                key={section.id}
                section={section}
                activeId={activeId}
                onItemClick={handleItemClick}
                />
            ))}
            </div>
        ) : (
            <EmptyState query={search} />
        )}

        </div>
    );
    }

    // ============================================================
    // PAGE HEADER
    // ============================================================

    function PageHeader({ search, onSearchChange, onClearSearch }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">

        {/* Title */}
        <div className="flex items-center gap-4">
            <div>
                <BackButton to="/dashboard" className="mb-3" />
            </div>
            <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Settings
            </h1>
            <p className="text-sm text-slate-500 mt-1">
            Manage your workspace preferences and integrations
            </p>
            </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm w-full sm:w-72">
            <svg
            className="text-slate-500 w-4 h-4 shrink-0"
            fill="none" stroke="currentColor" strokeWidth={2}
            viewBox="0 0 24 24"
            >
            <path strokeLinecap="round" strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
            type="text"
            placeholder="Search settings..."
            value={search}
            onChange={onSearchChange}
            className="flex-1 text-sm text-slate-700 bg-transparent outline-none placeholder:text-slate-500"
            />
            {search && (
            <button
                onClick={onClearSearch}
                className="text-slate-500 hover:text-slate-700 text-xs transition-colors"
            >
                ✕
            </button>
            )}
        </div>

        </div>
    );
    }

    // ============================================================
    // STATS BAR
    // ============================================================

    function StatsBar() {
    return (
        <div className="flex items-center bg-white border border-slate-200 rounded-2xl shadow-sm mb-8 w-fit overflow-hidden">
        {STATS.map((stat, index) => (
            <div key={stat.label} className="flex items-center">

            {/* Stat Item */}
            <div className="flex flex-col items-center px-8 py-4">
                <span className="text-2xl font-bold text-blue-900 leading-none">
                {stat.value}
                </span>
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-widest mt-1">
                {stat.label}
                </span>
            </div>

            {/* Divider — not after last */}
            {index < STATS.length - 1 && (
                <div className="w-px h-10 bg-slate-100" />
            )}

            </div>
        ))}
        </div>
    );
    }

    // ============================================================
    // SETTINGS CARD
    // ============================================================

    function SettingsCard({ section, activeId, onItemClick }) {
    return (
        <div
        className="
            bg-white rounded-2xl border border-slate-100 border-t-4 border-t-blue-900
            shadow-sm hover:shadow-md hover:-translate-y-0.5
            transition-all duration-200 overflow-hidden
        "
        >

        {/* Card Header */}
        <div className="px-5 pt-5 pb-3">
            <h2 className="text-sm font-bold text-blue-900 tracking-tight">
            {section.label}
            </h2>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100 mx-5 mb-2" />

        {/* Items List */}
        <ul className="px-3 pb-4 space-y-0.5">
            {section.items.map((item) => (
            <SettingsItem
                key={item.id}
                item={item}
                isActive={activeId === item.id}
                onClick={() => onItemClick(item)}
            />
            ))}
        </ul>

        </div>
    );
    }

    // ============================================================
    // SETTINGS ITEM
    // ============================================================

    function SettingsItem({ item, isActive, onClick }) {
    return (
        <li
        onClick={onClick}
        className={`
            flex items-center gap-3 px-3 py-2.5 rounded-lg
            cursor-pointer group transition-colors duration-150
            ${isActive ? "bg-blue-50" : "hover:bg-blue-50"}
        `}
        >

        {/* Label */}
        <span className="flex-1 text-[13.5px] font-medium text-slate-600 group-hover:text-blue-900 transition-colors duration-150">
            {item.label}
        </span>

        {/* Pro Badge */}
        {item.badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide bg-blue-900 text-white">
            {item.badge}
            </span>
        )}

        {/* Chevron Arrow */}
        <svg
            className="w-3.5 h-3.5 shrink-0 text-slate-300 group-hover:text-blue-900 transition-colors duration-150"
            fill="none" stroke="currentColor" strokeWidth={2.5}
            viewBox="0 0 24 24"
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>

        </li>
    );
    }

    // ============================================================
    // EMPTY STATE
    // ============================================================

    function EmptyState({ query }) {
    return (
        <div className="flex flex-col items-center justify-center py-28 text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-900 flex items-center justify-center mb-5">
            <svg
            className="w-6 h-6 text-white"
            fill="none" stroke="currentColor" strokeWidth={2}
            viewBox="0 0 24 24"
            >
            <path strokeLinecap="round" strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
        </div>
        <p className="text-base font-semibold text-slate-700">
            No results for{" "}
            <span className="text-blue-900">"{query}"</span>
        </p>
        <p className="text-sm text-slate-400 mt-1">
            Try a different keyword
        </p>
        </div>
    );
    }