    // components/ComingSoon.jsx

    import { Sparkles, Rocket, Clock3, ArrowRight } from "lucide-react";

    const ComingSoon = ({
    title = "Something Exciting is Taking Shape",
    subtitle = "We're carefully crafting this experience to make it faster, smarter, and genuinely useful. Stay tuned — it'll be worth the wait.",
    icon: Icon = Rocket,
    }) => {
    return (
        <div className="flex min-h-[calc(100vh-240px)] items-center justify-center px-6 py-8">

        <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-linear-to-br from-slate-50 via-white to-blue-50 shadow-lg">

            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">

            <div className="absolute -left-16 top-8 h-56 w-56 rounded-full bg-cyan-300/25 blur-3xl animate-pulse" />

            <div className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-indigo-300/25 blur-3xl animate-pulse delay-700" />

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.05)_1px,transparent_1px)] bg-size-[28px_28px]" />

            </div>

            <div className="relative z-10 px-8 py-14 text-center">

            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-cyan-700 shadow-sm">

                <Sparkles size={15} />

                <span className="text-xs font-semibold tracking-[0.15em]">
                PRODUCT VISION
                </span>

            </div>

            {/* Icon */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-500 via-sky-500 to-indigo-600 shadow-lg shadow-cyan-400/25 transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:rotate-6">

                <Icon size={38} className="text-white" />

            </div>

            {/* Heading */}
            <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">

                {title}

            </h1>

            {/* Subtitle */}
            <p className="mx-auto max-w-2xl text-base leading-7 text-slate-600">

                {subtitle}

            </p>

            {/* Pills */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">

                <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                Better Experience
                </div>

                <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                Performance Focused
                </div>

                <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                Thoughtfully Designed
                </div>

            </div>

            {/* Divider */}
            <div className="mx-auto mt-8 h-px w-32 bg-linear-to-r from-transparent via-slate-300 to-transparent" />

            {/* Footer */}
            <div className="mt-6 flex items-center justify-center gap-2 text-slate-500">

                <Clock3 className="text-cyan-600" size={16} />

                <span className="text-sm font-medium">
                Great products are built with intention.
                </span>

                <ArrowRight
                size={15}
                className="animate-pulse text-cyan-600"
                />

            </div>

            </div>

        </div>

        </div>
    );
    };

    export default ComingSoon;