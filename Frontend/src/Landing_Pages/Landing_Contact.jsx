import { useState } from 'react';
import phiBenchBlueLogo from 'url:../assets/phiBenchBlueLogo.png';

// ── Social icons ────────────────────────────────────────────────────────────
// Plain hand-written inline SVGs (no icon library dependency) — these are
// universal, standardized brand glyphs rather than custom project icons, so
// there's no matching asset file to source the way there was for Industries.
const LinkedInIcon = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.24h4V23h-4V8.24zM8.5 8.24h3.83v2.01h.05c.53-1 1.84-2.06 3.79-2.06 4.05 0 4.8 2.67 4.8 6.14V23h-4v-6.7c0-1.6-.03-3.65-2.22-3.65-2.23 0-2.57 1.74-2.57 3.54V23h-4V8.24z" />
    </svg>
);
const XIcon = () => (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
        <path d="M18.9 1.5h3.4l-7.5 8.55L23.6 22.5h-6.9l-5.4-7.06-6.2 7.06H1.7l8.02-9.15L1 1.5h7.1l4.9 6.46 5.9-6.46zm-1.2 19h1.9L6.4 3.4H4.4l13.3 17.1z" />
    </svg>
);
const FacebookIcon = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
    </svg>
);
const InstagramIcon = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
        <circle cx="12" cy="12" r="4.2" />
        <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
    </svg>
);

const SocialCircle = ({ children, href = '#' }) => (
    <a
        href={href}
        aria-label="social link"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1A3989] text-white transition-transform duration-300 hover:scale-110"
    >
        {children}
    </a>
);

const FIELD_CLASS =
    'w-full rounded-xl bg-gray-100 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#1A3989]/40 transition';

export const LandingContact = () => {
    const [form, setForm] = useState({
        fullName: '',
        companyName: '',
        workEmail: '',
        phoneNumber: '',
        message: '',
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // No contact-form backend endpoint exists yet — this just captures the
    // fields locally and shows a confirmation. Wire this up to a real API
    // route once one exists.
    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
    };

    // "Send another message" clears the previous entry as well as the panel,
    // so the returning form isn't pre-filled with what was just sent.
    const handleReset = () => {
        setForm({
            fullName: '',
            companyName: '',
            workEmail: '',
            phoneNumber: '',
            message: '',
        });
        setSubmitted(false);
    };

    return (
        <>
            {/* ================= CONTACT CTA ================= */}
            <section id="contact" className="scroll-mt-16 min-h-[calc(100vh-4rem)] flex flex-col justify-center py-20 bg-white">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="rounded-[2rem] bg-linear-to-br from-[#3D41E7] to-[#1A3989] p-8 sm:p-12 lg:p-14">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

                            {/* Left copy */}
                            <div>
                                <h2 className="text-3xl sm:text-4xl font-bold text-white leading-snug">
                                    Start Managing Your Bench in Just 4 Minutes
                                </h2>
                                <p className="mt-5 text-sm text-white/80 leading-relaxed max-w-md">
                                    Simple pricing. Powerful platform. Fill out the form and our
                                    team will get in touch with you with the best plan for your
                                    business.
                                </p>
                            </div>

                            {/* Right form card */}
                            <div className="rounded-2xl bg-white p-6 sm:p-8">
                                {submitted ? (
                                    /* Success panel replaces the entire form — the min-height
                                       keeps the card the same size as the filled-in form so
                                       the surrounding layout doesn't jump on submit. */
                                    <div className="flex min-h-[344px] flex-col items-center justify-center text-center">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                            <svg
                                                viewBox="0 0 24 24"
                                                className="h-8 w-8"
                                                fill="none"
                                                stroke="#16A34A"
                                                strokeWidth="2.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                aria-hidden="true"
                                            >
                                                <path d="M5 12.5l4.5 4.5L19 7.5" />
                                            </svg>
                                        </div>

                                        <h3 className="mt-6 text-xl font-bold text-gray-900">Thank You!</h3>

                                        <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-600">
                                            Thank you for your interest in PhiBench. One of our experts
                                            will contact you shortly to discuss your bench management
                                            requirements.
                                        </p>

                                        <button
                                            type="button"
                                            onClick={handleReset}
                                            className="mt-6 text-sm font-bold text-[#1A3989] transition-colors duration-300 hover:text-[#3D41E7] cursor-pointer"
                                        >
                                            Send another message
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="text-lg font-bold text-gray-900 mb-5">Get in Touch</h3>

                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <input
                                                    type="text"
                                                    name="fullName"
                                                    placeholder="Full Name"
                                                    value={form.fullName}
                                                    onChange={handleChange}
                                                    className={FIELD_CLASS}
                                                />
                                                <input
                                                    type="text"
                                                    name="companyName"
                                                    placeholder="Company Name"
                                                    value={form.companyName}
                                                    onChange={handleChange}
                                                    className={FIELD_CLASS}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <input
                                                    type="email"
                                                    name="workEmail"
                                                    placeholder="Work Email"
                                                    value={form.workEmail}
                                                    onChange={handleChange}
                                                    className={FIELD_CLASS}
                                                />
                                                <input
                                                    type="tel"
                                                    name="phoneNumber"
                                                    placeholder="Phone Number"
                                                    value={form.phoneNumber}
                                                    onChange={handleChange}
                                                    className={FIELD_CLASS}
                                                />
                                            </div>

                                            <textarea
                                                name="message"
                                                placeholder="Your Message"
                                                rows={4}
                                                value={form.message}
                                                onChange={handleChange}
                                                className={`${FIELD_CLASS} resize-none`}
                                            />

                                            <button
                                                type="submit"
                                                className="w-full rounded-xl border border-[#1A3989] bg-white py-3 text-sm font-bold text-[#1A3989] transition-all duration-300 hover:bg-[#1A3989] hover:text-white cursor-pointer"
                                            >
                                                Contact Us
                                            </button>
                                        </form>
                                    </>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </section>

            {/* ================= FOOTER ================= */}
            <footer className="bg-white border-t border-gray-100">
                {/* Full-bleed with the same horizontal padding as the navbar
                    (px-5 / md:px-6) so the footer's outer edges stay aligned
                    with the navbar's logo and Login button at every width,
                    instead of being capped at a fixed centred column. */}
                <div className="w-full px-5 md:px-6 py-14">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

                        {/* Logo + tagline */}
                        <div>
                            <img src={phiBenchBlueLogo} alt="PhiBench Logo" className="h-10 w-auto object-contain mb-4" />
                            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                                PhiBENCH is a platform for simplifying bench management. We
                                deliver smart, shared solutions for all your business resource
                                needs.
                            </p>
                        </div>

                        {/* Platform links */}
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 mb-4">Platform</h4>
                            <ul className="space-y-3 text-sm text-gray-500">
                                <li><a href="#home" className="hover:text-[#1A3989] transition-colors">Home</a></li>
                                <li><a href="#features" className="hover:text-[#1A3989] transition-colors">Features</a></li>
                                <li><a href="#industries" className="hover:text-[#1A3989] transition-colors">Industries</a></li>
                                <li><a href="#contact" className="hover:text-[#1A3989] transition-colors">Contact Us</a></li>
                                <li><a href="#testimonials" className="hover:text-[#1A3989] transition-colors">Testimonials</a></li>
                            </ul>
                        </div>

                        {/* Company links */}
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 mb-4">Company</h4>
                            <ul className="space-y-3 text-sm text-gray-500">
                                <li><a href="#" className="hover:text-[#1A3989] transition-colors">Career</a></li>
                                <li><a href="#" className="hover:text-[#1A3989] transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-[#1A3989] transition-colors">Support Center</a></li>
                                <li><a href="#" className="hover:text-[#1A3989] transition-colors">Privacy Policy</a></li>
                            </ul>
                        </div>

                        {/* Social media */}
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 mb-4">Social Media</h4>
                            <div className="flex items-center gap-3">
                                <SocialCircle><LinkedInIcon /></SocialCircle>
                                <SocialCircle><XIcon /></SocialCircle>
                                <SocialCircle><FacebookIcon /></SocialCircle>
                                <SocialCircle><InstagramIcon /></SocialCircle>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-gray-100">
                    <div className="w-full px-5 md:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
                        <p>&copy; {new Date().getFullYear()} PhiBENCH.</p>
                        <p>All Rights Reserved</p>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default LandingContact;