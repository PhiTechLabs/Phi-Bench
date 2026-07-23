import Landing_Navbar from "./Landing_Navbar";
import LandingHome from "./Landing_Home";

function Landing_Page() {
    return (
        <div className="min-h-screen">

            <Landing_Navbar />
            <LandingHome />

            {/* Landing Page Content Will Come Here */}

        </div>
    );
}

export default Landing_Page;