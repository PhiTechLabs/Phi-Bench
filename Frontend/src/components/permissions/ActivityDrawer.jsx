import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { FaTimes, FaHistory } from "react-icons/fa";

// ───────────────── LABEL MAPS ─────────────────
const ACTION_LABELS = {
    view: "View",
    edit: "Edit",
    add: "Add",
    delete: "Delete",
};

const PERMISSION_LABELS = {
    none: "None",
    own: "Own",
    all: "All",
    approval: "Approval",
    team: "Team",
    hierarchy: "Hierarchy",
    reporting: "Reporting",
};

export default function ActivityDrawer({ open, onClose, module }) {

    // ───────────────── MOUNT / ANIMATION STATE ─────────────────
    const [mounted, setMounted] = useState(false);
    const [visible, setVisible] = useState(false);

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    // ───────────────── HANDLE MOUNT/UNMOUNT FOR EXIT ANIMATION ─────────────────
    useEffect(() => {

        if (open) {

            setMounted(true);

            requestAnimationFrame(() => {
                setVisible(true);
            });

        } else {

            setVisible(false);

            const timer = setTimeout(() => {
                setMounted(false);
            }, 300);

            return () => clearTimeout(timer);
        }

    }, [open]);

    // ───────────────── FETCH LOGS ─────────────────
    const fetchLogs = async () => {

        setLoading(true);

        try {

            const res = await axiosInstance.get(
                "/roles/activity-logs",
                {
                    params: module
                        ? { module: module.toLowerCase() }
                        : {},
                }
            );

            setLogs(res.data.logs || []);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {

        if (open) {
            fetchLogs();
        }

    }, [open, module]);

    // ───────────────── CLOSE ON ESCAPE ─────────────────
    useEffect(() => {

        const handleKey = (e) => {
            if (e.key === "Escape") onClose();
        };

        if (open) {
            window.addEventListener("keydown", handleKey);
        }

        return () => window.removeEventListener("keydown", handleKey);

    }, [open, onClose]);

    if (!mounted) return null;

    return (

        <div className="fixed inset-0 z-50">

            {/* BACKDROP */}
            <div
                onClick={onClose}
                className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
                    visible ? "opacity-100" : "opacity-0"
                }`}
            />

            {/* PANEL */}
            <div
                className={`absolute right-0 top-0 h-full w-full sm:w-105 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
                    visible ? "translate-x-0" : "translate-x-full"
                }`}
            >

                {/* HEADER */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 shrink-0">

                    <div className="flex items-center gap-2.5 min-w-0">

                        <FaHistory className="text-blue-600 text-sm shrink-0" />

                        <h2 className="text-base font-semibold text-gray-800 truncate">
                            Activity Log
                            {module && (
                                <span className="text-blue-600">
                                    {" "}&gt; {module}
                                </span>
                            )}
                        </h2>

                    </div>

                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition shrink-0"
                    >
                        <FaTimes className="text-sm" />
                    </button>

                </div>

                {/* LOG LIST */}
                <div className="flex-1 overflow-y-auto px-4 py-4">

                    {loading ? (

                        <div className="flex items-center justify-center py-16 text-sm text-gray-400">
                            Loading activity…
                        </div>

                    ) : logs.length === 0 ? (

                        <div className="flex flex-col items-center justify-center py-16 text-gray-300">
                            <FaHistory className="text-3xl mb-2 opacity-40" />
                            <p className="text-sm text-gray-400">
                                No activity recorded yet
                            </p>
                        </div>

                    ) : (

                        <div className="flex flex-col gap-2.5">

                            {logs.map((log) => (
                                <ActivityLogItem
                                    key={log._id}
                                    log={log}
                                />
                            ))}

                        </div>
                    )}

                </div>

            </div>

        </div>
    );
}

// ───────────────── LOG ITEM ─────────────────
function ActivityLogItem({ log }) {

    const username = log.userId?.username || "Unknown user";
    const initial = username.charAt(0).toUpperCase();

    const dateObj = new Date(log.createdAt);

    const dateStr = dateObj.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    const timeStr = dateObj.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (

        <div className="group flex gap-3 p-3.5 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/40 hover:shadow-sm hover:scale-[1.015] transition-all duration-200 cursor-default">

            {/* AVATAR */}
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                {initial}
            </div>

            {/* CONTENT */}
            <div className="min-w-0 flex-1">

                <div className="flex items-center justify-between gap-2">

                    <span className="text-sm font-semibold text-gray-800 truncate">
                        {username}
                    </span>

                    <span className="text-[11px] text-gray-400 shrink-0">
                        {timeStr}
                    </span>

                </div>

                <p className="text-xs text-gray-400 mb-1.5">
                    {dateStr}
                    {log.roleName && (
                        <>
                            {" "}on{" "}
                            <span className="text-gray-500 font-medium capitalize">
                                {log.roleName.replace(/_/g, " ")}
                            </span>
                        </>
                    )}
                </p>

                <div className="flex flex-col gap-1">

                    {(log.changes || []).map((change, idx) => (

                        <div
                            key={idx}
                            className="text-xs text-gray-600 flex items-center gap-1 flex-wrap"
                        >
                            <span className="font-medium text-gray-700">
                                {ACTION_LABELS[change.field] || change.field}:
                            </span>

                            <span className="px-1.5 py-0.5 rounded-md bg-red-50 text-red-500 font-medium">
                                {PERMISSION_LABELS[change.oldValue] || change.oldValue}
                            </span>

                            <span className="text-gray-300">→</span>

                            <span className="px-1.5 py-0.5 rounded-md bg-green-50 text-green-600 font-medium">
                                {PERMISSION_LABELS[change.newValue] || change.newValue}
                            </span>
                        </div>
                    ))}

                </div>

            </div>

        </div>
    );
}