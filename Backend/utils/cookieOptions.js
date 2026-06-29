// ─── COOKIE OPTIONS (ENVIRONMENT-AWARE) ───────────────────────────────────────
// Centralizes the secure/sameSite logic so every cookie set anywhere in the
// app behaves correctly in both environments without repeating this check:
//
//   - Local dev: frontend and backend are both http://localhost, so the
//     browser treats them as same-site. sameSite: "lax" + secure: false
//     works fine, and secure:true would actually break things locally
//     since plain HTTP can't set a "secure" cookie at all.
//
//   - Production: Vercel (frontend) and Railway (backend) are two
//     different domains, so this is a genuine cross-site request from the
//     browser's point of view. Cross-site cookies REQUIRE both
//     sameSite: "none" AND secure: true together — browsers will silently
//     refuse to send the cookie on the next request otherwise, which looks
//     like "login works but you're immediately logged out".
//
// Controlled by NODE_ENV, which every host (Railway, Render, etc.) sets to
// "production" automatically — nothing extra to configure beyond that.
const isProduction = process.env.NODE_ENV === "production";

export const cookieOptions = (maxAge) => ({
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    ...(maxAge !== undefined && { maxAge }),
});

// clearCookie must be called with the SAME secure/sameSite options used to
// set the cookie, or the browser won't recognize it as the same cookie and
// won't actually clear it. maxAge is irrelevant for clearing.
export const clearCookieOptions = () => cookieOptions();