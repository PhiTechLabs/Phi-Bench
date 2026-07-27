import { useEffect, useRef, useState } from 'react';
import interviewIconWhite from 'url:../assets/icons/interviewIconWhite.png';
import interviewIcon from 'url:../assets/icons/interviewIcon.png';
import jobIcon from 'url:../assets/icons/jobIcon.png';
import jobIconWhite from 'url:../assets/icons/jobIconWhite.png';
import deploymentIcon from 'url:../assets/icons/deploymentIcon.png';
import deploymentIconWhite from 'url:../assets/icons/deploymentIconWhite.png';
import resourceIcon from 'url:../assets/icons/resourceIcon.png';
import resourceIconWhite from 'url:../assets/icons/resourceIconWhite.png';
import clientIcon from 'url:../assets/icons/clientIcon.png';
import clientIconWhite from 'url:../assets/icons/clientIconWhite.png';
import resourcePlanningIcon from 'url:../assets/icons/resourcePlanningIcon.png';
import resourcePlanningIconWhite from 'url:../assets/icons/resourcePlanningIconWhite.png';
import benchIcon from 'url:../assets/icons/benchIcon.png';
import benchIconWhite from 'url:../assets/icons/benchIconWhite.png';
import whiteGloveIcon from 'url:../assets/icons/whiteGloveIcon.png';
import whiteGloveIconWhite from 'url:../assets/icons/whiteGloveIconWhite.png';

    const featuresData = [
    {
        icon: interviewIcon,
        iconActive: interviewIconWhite,
        title: 'Interview Management',
        description: 'Schedule, track, and manage interviews with seamless status updates.',
    },
    {
        icon: jobIcon,
        iconActive: jobIconWhite,
        title: 'Job Management',
        description: 'Manage job openings, requirements, and postings from one platform.',
    },
    {
        icon: deploymentIcon,
        iconActive: deploymentIconWhite,
        title: 'Deployment Management',
        description: 'Track deployments and streamline onboarding from start to closure.',
    },
    {
        icon: resourceIcon,
        iconActive: resourceIconWhite,
        title: 'Resources Management',
        description: 'Manage skills, profiles, certifications, and availability with ease.',
    },
    {
        icon: clientIcon,
        iconActive: clientIconWhite,
        title: 'Client Management',
        description: 'Manage client relationships and track interactions in one place.',
    },
    {
        icon: resourcePlanningIcon,
        iconActive: resourcePlanningIconWhite,
        title: 'Resources Planning',
        description: 'Plan resources proactively and match talent to client needs faster..',
    },
    {
        icon: benchIcon,
        iconActive: benchIconWhite,
        title: 'Resource Management',
        description: 'Manage skills, profiles, certifications, and availability with ease.',
    },
    {
        icon: whiteGloveIcon,
        iconActive: whiteGloveIconWhite,
        title: 'White Glove Support',
        description: 'Get expert support to ensure smooth operations and business success.',
    },
    ];

    // ── Large-monitor override ──────────────────────────────────────────
    // Only kicks in above LARGE_SCREEN_BREAKPOINT. Below this width, every
    // number below falls back to your existing laptop values — nothing about
    // the laptop/tablet/mobile layout changes.
    const LARGE_SCREEN_BREAKPOINT = 1536; // px
    const LARGE_CARD_WIDTH = 460; // bigger card on large monitors
    const LARGE_GAP = 32; // wider gap to match the bigger card

    const useIsLargeScreen = () => {
    const [isLarge, setIsLarge] = useState(
        typeof window !== 'undefined' ? window.innerWidth >= LARGE_SCREEN_BREAKPOINT : false
    );

    useEffect(() => {
        const handleResize = () => setIsLarge(window.innerWidth >= LARGE_SCREEN_BREAKPOINT);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return isLarge;
    };

    // ── Layout constants ──────────────────────────────────────────────
    const BASE_CARD_WIDTH = 330; // w-80 — unchanged laptop/default value
    const BASE_GAP = 12; // gap-3 — unchanged laptop/default value
    const VISIBLE_CARDS = 3;

    // Extra breathing room so a scaled-up card isn't clipped by the viewport box.
    // Increase VERTICAL_BREATHING_ROOM if the top/bottom of the scaled card still looks cut off.
    // This must also clear the card's drop shadow, not just the card box: shadow-2xl is
    // 0 25px 50px -12px, which reaches ~38px below the card, and the active card's
    // scale(1.05) adds ~6px more. Anything less and the shadow gets sliced off by the
    // container's overflow-hidden, leaving a hard grey edge under the row.
    const VERTICAL_BREATHING_ROOM = 64; // px, added as top+bottom padding on the viewport

    // ── Timing constants ──────────────────────────────────────────────
    const MOVE_DURATION = 800; // ms — how long the slide itself takes
    // Color now runs THE SAME LENGTH as the move, and starts at the same instant the
    // move starts — so the gradient gradually builds in while the card is still
    // traveling, and finishes right as the card lands in the center.
    const COLOR_DURATION = 800; // ms
    const COLOR_DELAY = 0; // ms

    // Scale kicks in after most of the travel/color has happened, giving a quick
    // "pop" right as (or just after) the card settles, rather than scaling the
    // whole time it's moving.
    const SCALE_DELAY = 500; // ms
    const SCALE_DURATION = 400; // ms

    const PAUSE_DURATION = 1000; // ms — how long the card stays centered + highlighted before next move

    const TOTAL_COPIES = 3;
    const loopFeatures = Array.from({ length: TOTAL_COPIES }, () => featuresData).flat();

    export const LandingFeatures = () => {
    const cardRefs = useRef([]);
    const isLargeScreen = useIsLargeScreen();

    // Only these two change on large monitors — everything else is identical
    // to what you already had.
    const CARD_WIDTH = isLargeScreen ? LARGE_CARD_WIDTH : BASE_CARD_WIDTH;
    const GAP = isLargeScreen ? LARGE_GAP : BASE_GAP;

    const STEP = CARD_WIDTH + GAP;
    const VIEWPORT_WIDTH = CARD_WIDTH * VISIBLE_CARDS + GAP * (VISIBLE_CARDS - 1);
    const CENTER_OFFSET = (VIEWPORT_WIDTH - CARD_WIDTH) / 2;

    const [index, setIndex] = useState(featuresData.length);
    const [withTransition, setWithTransition] = useState(true);

    // Advance to the next card after MOVE_DURATION + PAUSE_DURATION.
    // isActive is now tied directly to `index`, which changes at the exact
    // moment the slide starts — so color transition begins immediately and
    // plays out DURING the movement instead of waiting for it to finish.
    useEffect(() => {
        const nextMoveTimer = setTimeout(() => {
        setIndex((prev) => prev + 1);
        }, MOVE_DURATION + PAUSE_DURATION);

        return () => clearTimeout(nextMoveTimer);
    }, [index]);

    // Seamless loop reset — once we've scrolled through two copies, snap back
    // (no transition) to the equivalent spot earlier in the array
    useEffect(() => {
        if (index >= featuresData.length * 2) {
        const timer = setTimeout(() => {
            setWithTransition(false);
            setIndex((prev) => prev - featuresData.length);
        }, MOVE_DURATION);

        return () => clearTimeout(timer);
        }
    }, [index]);

    useEffect(() => {
        if (!withTransition) {
        const raf1 = requestAnimationFrame(() => {
            const raf2 = requestAnimationFrame(() => setWithTransition(true));
            return () => cancelAnimationFrame(raf2);
        });
        return () => cancelAnimationFrame(raf1);
        }
    }, [withTransition]);

    return (
        <section id="features" className="scroll-mt-16 min-h-[calc(100vh-4rem)] flex flex-col justify-center py-20 bg-white overflow-hidden">
        <div className="text-center mb-16 px-4">
            <h2 className="text-4xl font-bold text-gray-900 leading-snug">
            Get The Most Powerful and{' '}
            <br />
            <span style={{ color: '#1A3989' }}>Easy to Use</span> Bench Platform
            </h2>
        </div>

        <div className="w-full flex justify-center">
            <div
            className="overflow-hidden"
            style={{
                width: VIEWPORT_WIDTH,
                maxWidth: '100%',
                // Extra vertical padding so a scaled-up card has room to expand
                // without its top/bottom getting clipped by this container.
                paddingTop: VERTICAL_BREATHING_ROOM,
                paddingBottom: VERTICAL_BREATHING_ROOM,
                marginTop: -VERTICAL_BREATHING_ROOM,
                marginBottom: -VERTICAL_BREATHING_ROOM,
                WebkitMaskImage:
                'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
                maskImage:
                'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
            }}
            >
            <div
                className="flex w-max h-60"
                style={{
                gap: GAP,
                paddingLeft: CENTER_OFFSET,
                paddingRight: CENTER_OFFSET,
                transform: `translateX(-${index * STEP}px)`,
                transition: withTransition
                    ? `transform ${MOVE_DURATION}ms ease-in-out`
                    : 'none',
                }}
            >
                {loopFeatures.map((feature, idx) => {
                const isActive = idx === index;

                return (
                    <div
                    key={idx}
                    ref={(el) => (cardRefs.current[idx] = el)}
                    className={`shrink-0 p-8 rounded-3xl ${
                        isActive ? 'shadow-2xl' : 'bg-white shadow-md'
                    }`}
                    style={{
                        width: CARD_WIDTH,
                        transform: isActive ? 'scale(1.05)' : 'scale(1)',
                        background: isActive
                        ? 'linear-gradient(135deg, #3D41E7 0%, #1A3989 100%)'
                        : undefined,
                        transition: `
                        background ${COLOR_DURATION}ms ease-in-out ${COLOR_DELAY}ms,
                        box-shadow ${COLOR_DURATION}ms ease-in-out ${COLOR_DELAY}ms,
                        transform ${SCALE_DURATION}ms ease-in-out ${SCALE_DELAY}ms
                        `,
                    }}
                    >
                    <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 transition-colors duration-300 ${
                        isActive ? 'bg-white/10' : 'bg-blue-50'
                        }`}
                    >
                        <img
                        src={isActive ? feature.iconActive : feature.icon}
                        alt={feature.title}
                        className="w-full h-full"
                        />
                    </div>

                    <h3
                        className={`text-xl font-bold mb-3 transition-colors duration-300 ${
                        isActive ? 'text-white' : 'text-gray-900'
                        }`}
                    >
                        {feature.title}
                    </h3>

                    <p
                        className={`text-sm leading-relaxed transition-colors duration-300 ${
                        isActive ? 'text-white/90' : 'text-gray-500'
                        }`}
                    >
                        {feature.description}
                    </p>
                    </div>
                );
                })}
            </div>
            </div>
        </div>
        </section>
    );
    };