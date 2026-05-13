    import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
    import Login from "../pages/Login";
    import Navbar from "./Navbar";
    import { roleRoutes } from "../routes/roleRoutes";
    import Setup from "../pages/Setup";

    function App() {
    return (
        <Router>
        <Routes>

            {/* LOGIN */}
            <Route path="/login" element={<Login />} />

            {/*  SETUP — accessible by all roles, outside Navbar layout */}
            <Route path="/setup" element={<Setup />} />

             {/* ALL OTHER ROUTES — same URLs for every role */}
            <Route path="/" element={<Navbar />}>
            {roleRoutes.map((route, index) => (
                <Route key={index} {...route} />
            ))}
            </Route>
        </Routes>
        </Router>
    );
    }

    export default App;
