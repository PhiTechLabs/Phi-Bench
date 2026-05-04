    import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
    import Login from "../pages/Login";
    // import Layout from "./layout";
    import Navbar from "./Navbar";
    import { roleRoutes } from "../routes/roleRoutes";
    import Setup from "../pages/Setup";

    function App() {
    return (
        <Router>
        <Routes>

            {/* LOGIN */}
            <Route path="/" element={<Login />} />

            {/*  SETUP — accessible by all roles, outside Navbar layout */}
            <Route path="/setup" element={<Setup />} />

            {/* CLIENT */}
            <Route path="/client" element={<Navbar />}>
            {roleRoutes.map((route, index) => (
                <Route key={index} {...route} />
            ))}
            </Route>

            {/* ADMIN */}
            <Route path="/admin" element={<Navbar />}>
            {roleRoutes.map((route, index) => (
                <Route key={index} {...route} />
            ))}
            </Route>

            {/* SUPERADMIN */}
            <Route path="/superadmin" element={<Navbar />}>
            {roleRoutes.map((route, index) => (
                <Route key={index} {...route} />
            ))}
            </Route>

        </Routes>
        </Router>
    );
    }

    export default App;
