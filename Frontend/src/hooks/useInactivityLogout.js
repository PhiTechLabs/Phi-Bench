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
//
// IMPORTANT — why this isn't just "reset a timer on every event":
// setInterval does NOT run while a laptop is asleep or a tab is deeply
// backgrounded, so a periodic check alone can silently fail to fire for
// hours. And if the very first event after waking (e.g. a mousemove) just
// blindly reset the clock, it would erase the entire idle gap before
// anything ever got a chance to notice it — which is exactly what let a
// whole overnight idle period slip through undetected. So every "activity"
// handler here checks elapsed time FIRST and only resets the clock if the
// user genuinely wasn't idle past the limit yet. Visibility/focus changes
// also trigger an immediate check, so returning to a backgrounded tab
// doesn't have to wait on the next lazy interval tick either.
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

        // True if the stored timestamp already shows the user was idle
        // past the limit. Checked before every reset, not just on mount.
        const isAlreadyIdle = () => {
            const last = Number(localStorage.getItem(ACTIVITY_KEY));
            return !!last && Date.now() - last >= INACTIVITY_LIMIT_MS;
        };

        // Catches the case where the tab was closed/asleep for longer than
        // the limit and is only now being opened/resumed.
        if (isAlreadyIdle()) {
            fire();
            return;
        }

        const markActive = () => {
            if (cancelled) return;
            // Check-then-reset, never reset-then-check — see note above.
            if (isAlreadyIdle()) { fire(); return; }
            localStorage.setItem(ACTIVITY_KEY, String(Date.now()));
        };
        markActive();

        const checkIdle = () => {
            if (isAlreadyIdle()) fire();
        };

        ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, markActive, { passive: true }));

        // A backgrounded tab's setInterval can be throttled arbitrarily
        // (or not run at all through a sleep cycle) — re-check the instant
        // the tab becomes visible/focused again rather than trusting only
        // the interval below.
        document.addEventListener("visibilitychange", checkIdle);
        window.addEventListener("focus", checkIdle);

        const intervalId = setInterval(checkIdle, CHECK_INTERVAL_MS);

        return () => {
            cancelled = true;
            ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, markActive));
            document.removeEventListener("visibilitychange", checkIdle);
            window.removeEventListener("focus", checkIdle);
            clearInterval(intervalId);
        };
    }, []);
}