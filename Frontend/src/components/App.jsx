    import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
    import Login from "../pages/Login";
    import Layout from "./layout";
    import { roleRoutes } from "../routes/roleRoutes";

    function App() {
    return (
        <Router>
        <Routes>

            {/* LOGIN */}
            <Route path="/" element={<Login />} />

            {/* CLIENT */}
            <Route path="/client" element={<Layout />}>
            {roleRoutes.map((route, index) => (
                <Route key={index} {...route} />
            ))}
            </Route>

            {/* ADMIN */}
            <Route path="/admin" element={<Layout />}>
            {roleRoutes.map((route, index) => (
                <Route key={index} {...route} />
            ))}
            </Route>

            {/* SUPERADMIN */}
            <Route path="/superadmin" element={<Layout />}>
            {roleRoutes.map((route, index) => (
                <Route key={index} {...route} />
            ))}
            </Route>

        </Routes>
        </Router>
    );
    }

    export default App;