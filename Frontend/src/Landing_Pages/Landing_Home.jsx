import { useEffect, useState } from "react";

import mainImage from "url:../assets/main_image.png";
import leftImage from "url:../assets/leftImage.png";
import rightImage from "url:../assets/rightImage.png";
import icon1 from "url:../assets/icon1.png";
import icon2 from "url:../assets/icon2.png";
import icon3 from "url:../assets/icon3.png";

// Counter Animation Component
function Counter({ target, suffix = "+", duration = 2000 }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const progress = Math.min(
                (currentTime - startTime) / duration,
                1
            );

            const currentValue = Math.floor(progress * target);

            setCount(currentValue);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setCount(target);
            }
        };

        requestAnimationFrame(animate);
    }, [target, duration]);

    return (
        <>
            {count.toLocaleString()}
            {suffix}
        </>
    );
}


function LandingHome() {
    return (
        <section
            id="home"
            className="w-full overflow-hidden bg-linear-to-br from-[#3D41E7] to-[#1A3989]"
        >

            {/* ================= HERO SECTION ================= */}
            <div className="mx-auto flex max-w-7xl flex-col items-center px-6 pt-16 text-center sm:px-10 lg:px-16">

                {/* Heading */}
                <h1 className="max-w-5xl text-2xl font-bold leading-tight text-white sm:text-5xl lg:text-5xl">
                    The Smart Bench Management Platform
                    <br />
                    for IT Businesses
                </h1>


                {/* Description */}
                <p className="mt-5 max-w-4xl text-xs leading-relaxed text-white/90 sm:text-base">
                    PhiBench helps IT staffing companies manage verified bench
                    resources, track resource availability, streamline
                    <br />
                    deployments, and connect with trusted hiring partners all
                    from a single platform.
                </p>


                {/* ================= IMAGE AREA ================= */}
                <div className="relative mt-10 w-full max-w-6xl">

                    {/* Main Image Card */}
                    <div className="relative z-10 mx-auto transition-transform duration-300 ease-out hover:-translate-y-2 sm:w-[65%] lg:w-[65%]">


                        {/* Main Dashboard Image */}
                        <img
                            src={mainImage}
                            alt="PhiBench dashboard"
                            className="block w-full drop-shadow-2xl"
                        />

                    </div>


                    {/* Left Floating Image */}
                    <div className="absolute left-0 top-[38%] z-20 w-[27%] -rotate-2 transition-transform duration-300 ease-out hover:rotate-0 sm:left-[4%] sm:w-[24%] lg:left-[8%] lg:w-[22%]">

                        <img
                            src={leftImage}
                            alt="Hired Candidates"
                            className="block w-full drop-shadow-2xl"
                        />

                    </div>


                    {/* Right Floating Image */}
                    <div className="absolute right-0 top-[22%] z-20 w-[27%] rotate-2 transition-transform duration-300 ease-out hover:rotate-0 sm:right-[4%] sm:w-[24%] lg:right-[8%] lg:w-[22%]">

                        <img
                            src={rightImage}
                            alt="Client Satisfaction"
                            className="block w-full drop-shadow-2xl"
                        />

                    </div>

                </div>

            </div>


            {/* ================= STATISTICS SECTION ================= */}
            <div className="mt-0 border-t border-white/20 bg-[#244493]">

                <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-white/20 sm:grid-cols-3 sm:divide-x sm:divide-y-0">

                    {/* Stat 1 */}
                    <div className="flex flex-col items-center justify-center px-6 py-8 text-center">

                        <div className="flex items-center gap-2">

                            <img src={icon1} alt="" className="h-6 w-6" />

                            <p className="text-2xl font-bold text-white">
                                <Counter target={18000} />
                            </p>

                        </div>

                        <p className="mt-1 text-sm text-white/80">
                            IT Firms Registered
                        </p>

                    </div>


                    {/* Stat 2 */}
                    <div className="flex flex-col items-center justify-center px-6 py-8 text-center">

                        <div className="flex items-center gap-2">

                            <img src={icon2} alt="" className="h-6 w-6" />

                            <p className="text-2xl font-bold text-white">
                                <Counter target={65000} />
                            </p>

                        </div>

                        <p className="mt-1 text-sm text-white/80">
                            Bench Resources Listed
                        </p>

                    </div>


                    {/* Stat 3 */}
                    <div className="flex flex-col items-center justify-center px-6 py-8 text-center">

                        <div className="flex items-center gap-2">

                            <img src={icon3} alt="" className="h-6 w-6" />

                            <p className="text-2xl font-bold text-white">
                                <Counter target={240000} />
                            </p>

                        </div>

                        <p className="mt-1 text-sm text-white/80">
                            Leads Generated
                        </p>

                    </div>

                </div>

            </div>

        </section>
    );
}

export default LandingHome;