import { useEffect, useRef } from "react";

// ─── AUTO-LOGOUT ON INACTIVITY ─────────────────────────────────────────────
// Logs the user out after 3 hours with no genuine interaction (mouse, key,
// scroll, touch). Deliberately does NOT count background API calls (token
// refresh, dashboard polling, etc.) as "activity" — only real user input
// resets the clock, otherwise a tab left open silently polling in the
// background would keep the session alive forever.
//
// The last-activity timestamp lives in localStorage (not component state)
// so multiple tabs share one clock: whichever tab the user is actually
// using keeps the shared timestamp fresh, so idle background tabs don't
// each independently time out while the user is still active elsewhere.
const INACTIVITY_LIMIT_MS = 3 * 60 * 60 * 1000; // 3 hours
const CHECK_INTERVAL_MS   = 60 * 1000;           // poll the clock once a minute
const ACTIVITY_KEY        = "lastActivityAt";
const ACTIVITY_EVENTS     = ["mousemove", "mousedown", "keydown", "wheel", "scroll", "touchstart"];

// onTimeout: called once the user has been idle past the limit. Should log
// the user out (clear session, redirect to login) — the hook itself only
// decides *when*, not *how*.
export default function useInactivityLogout(onTimeout) {
    const onTimeoutRef = useRef(onTimeout);
    onTimeoutRef.current = onTimeout;

    useEffect(() => {
        // Nothing to guard if no one's logged in.
        if (!localStorage.getItem("user")) return;

        let cancelled = false;

        const fire = () => {
            if (cancelled) return;
            cancelled = true;
            localStorage.removeItem(ACTIVITY_KEY);
            onTimeoutRef.current?.();
        };

        // If the tab was closed/backgrounded and reopened after the limit
        // already elapsed, catch that immediately instead of waiting for
        // the next interval tick or resetting the clock just by loading.
        const existing = Number(localStorage.getItem(ACTIVITY_KEY));
        if (existing && Date.now() - existing >= INACTIVITY_LIMIT_MS) {
            fire();
            return;
        }

        const markActive = () => {
            if (!cancelled) localStorage.setItem(ACTIVITY_KEY, String(Date.now()));
        };
        markActive();

        const checkIdle = () => {
            const last = Number(localStorage.getItem(ACTIVITY_KEY) || Date.now());
            if (Date.now() - last >= INACTIVITY_LIMIT_MS) fire();
        };

        ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, markActive, { passive: true }));
        const intervalId = setInterval(checkIdle, CHECK_INTERVAL_MS);

        return () => {
            cancelled = true;
            ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, markActive));
            clearInterval(intervalId);
        };
    }, []);
}