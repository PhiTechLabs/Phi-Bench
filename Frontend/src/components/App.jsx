import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Navbar from "./Navbar";
import ProtectedRoute from "./ProtectedRoute";
import { roleRoutes } from "../routes/roleRoutes";
import Setup from "../pages/Setup";
import Unauthorized from "../pages/Unauthorized";

function App() {
    return (
        <Router>
            <Routes>
                {/* LOGIN */}
                <Route path="/" element={<Login />} />

                {/* SETUP — accessible by all roles, outside Navbar layout */}
                <Route path="/setup" element={<Setup />} />

                <Route
                    path="/unauthorized"
                    element={<Unauthorized />}
                />

                {/* PROTECTED ROUTES - No role prefix in URL */}
                <Route element={<Navbar />}>
                    {roleRoutes.map((route, index) => (
                        <Route key={index} {...route} />
                    ))}
                </Route>
            </Routes>
        </Router>
    );
}

export default App;