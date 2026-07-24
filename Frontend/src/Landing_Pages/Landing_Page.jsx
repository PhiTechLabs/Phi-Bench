import Landing_Navbar from "./Landing_Navbar";
import LandingHome from "./Landing_Home";
import { LandingFeatures } from "./Landing_Features";

function Landing_Page() {
    return (
        <div className="min-h-screen">

            <Landing_Navbar />
            <LandingHome />
            <LandingFeatures/>
            {/* Landing Page Content Will Come Here */}

        </div>
    );
}

export default Landing_Page;
