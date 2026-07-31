import itIcon from 'url:../assets/icons/itIcon.png';
import itIconWhite from 'url:../assets/icons/itIconWhite.png';
import healthcareIcon from 'url:../assets/icons/healthcareIcon.png';
import healthcareIconWhite from 'url:../assets/icons/healthcareIconWhite.png';
import financeIcon from 'url:../assets/icons/financeIcon.png';
import financeIconWhite from 'url:../assets/icons/financeIconWhite.png';
import telecomIcon from 'url:../assets/icons/telecomIcon.png';
import telecomIconWhite from 'url:../assets/icons/telecomIconWhite.png';
import retailIcon from 'url:../assets/icons/retailIcon.png';
import retailIconWhite from 'url:../assets/icons/retailIconWhite.png';
import manufacturingIcon from 'url:../assets/icons/manufacturingIcon.png';
import manufacturingIconWhite from 'url:../assets/icons/manufacturingIconWhite.png';
import educationIcon from 'url:../assets/icons/educationIcon.png';
import educationIconWhite from 'url:../assets/icons/educationIconWhite.png';
import consultingIcon from 'url:../assets/icons/consultingIcon.png';
import consultingIconWhite from 'url:../assets/icons/consultingIconWhite.png';

const industriesData = [
    { icon: itIcon, iconActive: itIconWhite, title: 'Information Technology' },
    { icon: healthcareIcon, iconActive: healthcareIconWhite, title: 'Healthcare & Life Sciences' },
    { icon: financeIcon, iconActive: financeIconWhite, title: 'Finance & Banking' },
    { icon: telecomIcon, iconActive: telecomIconWhite, title: 'Telecom' },
    { icon: retailIcon, iconActive: retailIconWhite, title: 'Retail & E-commerce' },
    { icon: manufacturingIcon, iconActive: manufacturingIconWhite, title: 'Manufacturing' },
    { icon: educationIcon, iconActive: educationIconWhite, title: 'Education' },
    { icon: consultingIcon, iconActive: consultingIconWhite, title: 'Consulting' },
];

export const LandingIndustries = () => {
    return (
        <section id="industries" className="scroll-mt-16 min-h-[calc(100vh-4rem)] flex flex-col justify-center py-20 bg-white relative overflow-hidden">

            {/* Soft radial glow behind the grid — matches the subtle blue halo
                visible in the design behind the card block. Purely decorative,
                sits below everything else via z-0 + pointer-events-none. */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-[260px] -translate-x-1/2 w-[1100px] h-[620px] rounded-full opacity-70 blur-3xl z-0"
                style={{
                    background:
                        'radial-gradient(circle, rgba(61,65,231,0.16) 0%, rgba(61,65,231,0.06) 45%, transparent 75%)',
                }}
            />

            {/* Heading */}
            <div className="relative z-10 text-center mb-16 px-4">
                <h2 className="text-4xl font-bold text-gray-900 leading-[44px] tracking-tight">
                    Solutions That are Endlessly{' '}
                    <br />
                    <span style={{ color: '#1A3989' }}>Adaptable</span> For Every Industry
                </h2>
                <p className="mt-4 max-w-[967px] mx-auto text-gray-500 text-base leading-relaxed">
                    Built for every vertical. Whether you're in IT, Healthcare, or Finance, our platform adapts to your
                    <br />
                    specific bench management workflows.
                </p>
            </div>

            {/* Industry Grid — 1272px content width to match the measured
                design (4 cards @ 300px + 3 gaps @ 24px = 1272px). */}
            <div className="relative z-10 max-w-[1272px] mx-auto px-6">
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {industriesData.map((industry, idx) => (
                        <div
                            key={idx}
                            className="group flex h-[167px] flex-col items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-linear-to-b from-white to-[#F7F9FF] shadow-sm px-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                        >
                            <div
                                className="relative shrink-0 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden group-hover:bg-[#1A3989]"
                                style={{ width: 61, height: 61 }}
                            >
                                {/* Default icon — instantly hidden on hover, no fade */}
                                <img
                                    src={industry.icon}
                                    alt={industry.title}
                                    className="block group-hover:hidden"
                                    style={{ width: 42, height: 42, objectFit: 'contain' }}
                                />
                                {/* White (active) icon — instantly shown on hover, no fade */}
                                <img
                                    src={industry.iconActive}
                                    alt=""
                                    aria-hidden="true"
                                    className="hidden group-hover:block"
                                    style={{ width: 42, height: 42, objectFit: 'contain' }}
                                />
                            </div>

                            <p className="text-sm font-medium text-gray-800 text-center">
                                {industry.title}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

        </section>
    );
};

export default LandingIndustries;