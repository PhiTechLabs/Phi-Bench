import { useEffect, useState } from 'react';

// ── Testimonial data ────────────────────────────────────────────────────────
const testimonialsData = [
    {
        quote: "What impressed us most is the simplicity of the platform. Tracking consultant availability, skills, and deployment status has never been easier. PhiBench saves our team valuable time every week.",
        name: 'Sneha Kapoor',
        role: 'Resource Manager',
    },
    {
        quote: "The platform helped us improve collaboration between our sales and resource management teams. We've increased bench utilization and closed client requirements much faster.",
        name: 'Amit Verma',
        role: 'Business Operations Lead',
    },
    {
        quote: "Finding verified resources used to take hours of back-and-forth communication. With PhiBench, everything is organized, verified, and accessible in one place. It's become an essential part of our staffing process.",
        name: 'Abhishek Nair',
        role: 'Delivery Head',
    },
];

// ── Layout constants ─────────────────────────────────────────────────────────
// SLOT_RATIO is the distance between two adjacent slot centers, expressed as a
// fraction of one card's width. Measured off the reference recording: the card
// box was 267px wide and the slots sat 210px apart, so the side cards
// deliberately OVERLAP the center card and tuck underneath it. Keeping this as
// a ratio means the overlap survives every breakpoint below.
const SLOT_RATIO = 0.786;

// Side cards in the reference are very close to the center card in size — the
// center only reads as bigger because the sides are blurred, faded and partly
// tucked under it. This is a deliberately subtle shrink; raise/lower it to
// taste without touching anything else.
const SIDE_SCALE = 0.94;
const SIDE_BLUR = 4; // px
const SIDE_OPACITY = 0.7;

// Clear space kept on every side of the stage so the cards' drop shadows fade
// out naturally instead of being sliced off by the stage's overflow-hidden.
// shadow-2xl reaches ~38px past the card box, and the side cards' 4px blur
// filter spreads a little further, so this needs comfortable headroom — too
// small and you get a hard grey edge under the row.
const EDGE_ROOM = 64;

// ── Timing ───────────────────────────────────────────────────────────────
// One full cycle in the reference ran ~3.9s, of which ~500ms was movement,
// split into two roughly equal legs either side of the hand-off.
const HOLD_MS = 3400;  // center card rests before the next role change
const IN_MS = 250;     // side cards travel inward and hide behind the center
const OUT_MS = 250;    // new side cards travel back out to their slots
const FADE_MS = 350;   // center card crossfades across the whole hand-off

// Inward leg accelerates away from the slot, outward leg decelerates into it.
const EASE_IN = 'cubic-bezier(0.4, 0, 1, 1)';
const EASE_OUT = 'cubic-bezier(0, 0, 0.2, 1)';

// ── Responsive geometry ──────────────────────────────────────────────────────
// Only the card box changes per breakpoint. The three slot positions are always
// derived from it, so the slots stay fixed on screen at every size.
const useStageGeometry = () => {
    const [width, setWidth] = useState(
        typeof window !== 'undefined' ? window.innerWidth : 1280
    );

    useEffect(() => {
        const onResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    let cardWidth = 406;
    let cardHeight = 260;

    if (width < 640) {
        cardWidth = Math.min(300, width - 56);
        cardHeight = 340;
    } else if (width < 1024) {
        cardWidth = 340;
        cardHeight = 290;
    }

    return { cardWidth, cardHeight, step: Math.round(cardWidth * SLOT_RATIO) };
};

// Wrap an index into the data array, handling negatives.
const wrap = (i) => ((i % testimonialsData.length) + testimonialsData.length) % testimonialsData.length;

// Resolve the testimonial sitting at a given slot for a given step. `offset` is
// the slot (+1 left, 0 center, -1 right). Subtracting the step is what makes the
// content travel leftward one slot per hand-off: the center card becomes the new
// left card, the right card becomes the new center, and the left card wraps
// around to the right — which is exactly why both side cards move inward.
const slotTestimonial = (step, offset) => testimonialsData[wrap(offset - step)];

// Simple flat 5-star row in the brand's blue.
const Stars = () => (
    <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} viewBox="0 0 20 20" className="w-4 h-4" fill="#1A3989">
                <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1 1 5.8L10 14.9l-5.21 2.62 1-5.8-4.21-4.1 5.82-.85z" />
            </svg>
        ))}
    </div>
);

// Generic dark-silhouette avatar placeholder, matching the design mock.
const Avatar = () => (
    <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#E5E7EB">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7v1H4z" />
        </svg>
    </div>
);

// Shared card body so the three slots can never drift apart visually.
const CardBody = ({ testimonial }) => (
    <>
        <div>
            <Stars />
            <p className="text-sm text-gray-700 leading-relaxed">
                "{testimonial.quote}"
            </p>
        </div>

        <div className="flex items-center gap-3 mt-6">
            <Avatar />
            <div>
                <p className="text-sm font-semibold text-gray-900">{testimonial.name}</p>
                <p className="text-xs text-gray-500">{testimonial.role}</p>
            </div>
        </div>
    </>
);

export const LandingTestimonial = () => {
    const { cardWidth, cardHeight, step } = useStageGeometry();

    // `index` is the settled center. `phase` drives the two-leg hand-off:
    //   idle -> in  : both side cards converge on the center and hide under it
    //   in   -> out : roles rotate, then the new side cards emerge outward
    const [index, setIndex] = useState(0);
    const [phase, setPhase] = useState('idle');
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        // Hovering only holds the carousel between hand-offs — a hand-off that
        // has already started always runs to completion, so the cards can never
        // be left frozen halfway underneath the center card.
        if (phase === 'idle' && paused) return;

        let t;
        if (phase === 'idle') {
            t = setTimeout(() => setPhase('in'), HOLD_MS);
        } else if (phase === 'in') {
            t = setTimeout(() => setPhase('out'), IN_MS);
        } else {
            t = setTimeout(() => {
                setIndex((prev) => prev + 1);
                setPhase('idle');
            }, OUT_MS);
        }
        return () => clearTimeout(t);
    }, [phase, paused]);

    const moving = phase !== 'idle';

    // Side cards pick up their NEW content the instant the outward leg starts —
    // they're fully hidden behind the center card at that moment, so the swap
    // is invisible. When the leg ends, `index` catches up and the value is
    // unchanged, which is what makes the loop seamless.
    const sideIndex = phase === 'out' ? index + 1 : index;
    const leftTestimonial = slotTestimonial(sideIndex, 1);
    const rightTestimonial = slotTestimonial(sideIndex, -1);

    // The center never moves or resizes — it crossfades in place across the
    // whole hand-off. Rendering every testimonial as a keyed layer keeps each
    // one's identity stable, so the fade never flashes when `index` catches up.
    const activeCenter = wrap(-(moving ? index + 1 : index));

    // Offset 0 == parked under the center card.
    const sideOffset = moving && phase === 'in' ? 0 : step;
    const sideTransition = `transform ${phase === 'in' ? IN_MS : OUT_MS}ms ${
        phase === 'in' ? EASE_IN : EASE_OUT
    }`;

    const sideCardClass =
        'absolute top-1/2 left-1/2 rounded-2xl bg-white p-6 flex flex-col justify-between shadow-md';

    const sideCardStyle = (direction) => ({
        width: cardWidth,
        height: cardHeight,
        transform: `translate(-50%, -50%) translateX(${direction * sideOffset}px) scale(${SIDE_SCALE})`,
        filter: `blur(${SIDE_BLUR}px)`,
        opacity: SIDE_OPACITY,
        zIndex: 10,
        pointerEvents: 'none',
        transition: sideTransition,
    });

    return (
        <section id="testimonials" className="scroll-mt-16 min-h-[calc(100vh-4rem)] flex flex-col justify-center py-20 bg-[#F8F9FC]">

            <div className="text-center mb-16 px-4">
                <h2 className="text-4xl font-bold text-gray-900 leading-[44px] tracking-tight">What Our Customers Say</h2>
                <p className="mt-4 max-w-[967px] mx-auto text-gray-500 text-base leading-relaxed">
                    How firms that have streamlined their resource management and
                    accelerated deployments with PhiBench.
                </p>
            </div>

            <div className="w-full flex justify-center">
                <div
                    className="relative overflow-hidden"
                    style={{
                        width: cardWidth + step * 2 + EDGE_ROOM * 2,
                        height: cardHeight + EDGE_ROOM * 2,
                        // The extra room exists only so shadows can fade; cancel it
                        // out of the vertical rhythm so the section spacing is
                        // unchanged from before.
                        marginTop: -EDGE_ROOM,
                        marginBottom: -EDGE_ROOM,
                        maxWidth: '100%',
                    }}
                    onMouseEnter={() => setPaused(true)}
                    onMouseLeave={() => setPaused(false)}
                >

                    {/* Left slot — travels right, under the center card, and back out */}
                    <div aria-hidden="true" className={sideCardClass} style={sideCardStyle(-1)}>
                        <CardBody testimonial={leftTestimonial} />
                    </div>

                    {/* Right slot — mirrors the left slot exactly */}
                    <div aria-hidden="true" className={sideCardClass} style={sideCardStyle(1)}>
                        <CardBody testimonial={rightTestimonial} />
                    </div>

                    {/* Center slot — a single fixed box; only its content changes */}
                    <div
                        className="absolute top-1/2 left-1/2 rounded-2xl bg-white p-6 shadow-2xl"
                        style={{
                            width: cardWidth,
                            height: cardHeight,
                            transform: 'translate(-50%, -50%)',
                            zIndex: 30,
                        }}
                    >
                        {testimonialsData.map((t, i) => (
                            <div
                                key={i}
                                aria-hidden={i !== activeCenter}
                                className="absolute inset-0 p-6 flex flex-col justify-between"
                                style={{
                                    opacity: i === activeCenter ? 1 : 0,
                                    transition: `opacity ${FADE_MS}ms ease-in-out`,
                                    pointerEvents: i === activeCenter ? 'auto' : 'none',
                                }}
                            >
                                <CardBody testimonial={t} />
                            </div>
                        ))}
                    </div>

                </div>
            </div>

        </section>
    );
};