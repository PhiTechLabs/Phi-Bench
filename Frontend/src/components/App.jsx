    import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
    import Login from "../pages/Login";
    // import Layout from "./layout";
    import Navbar from "./Navbar";
    import { roleRoutes } from "../routes/roleRoutes";

    function App() {
    return (
        <Router>
        <Routes>

            {/* LOGIN */}
            <Route path="/" element={<Login />} />

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