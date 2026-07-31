import Landing_Navbar from "./Landing_Navbar";
import LandingHome from "./Landing_Home";
import { LandingFeatures } from "./Landing_Features";
import LandingIndustries from "./Landing_Industries";
import { LandingTestimonial } from "./Landing_Testimonial";
import LandingFAQ from "./Landing_FAQ";
import LandingContact from "./Landing_Contact";

function Landing_Page() {
    return (
        <div className="landing-page min-h-screen">

            <Landing_Navbar />
            <LandingHome />
            <LandingFeatures/>
            <LandingIndustries />
            <LandingTestimonial />
            <LandingFAQ />
            <LandingContact />

        </div>
    );
}

export default Landing_Page;