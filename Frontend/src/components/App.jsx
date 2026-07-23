import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from "../Landing_Pages/Landing_Page";
import Login from "../pages/Login";

import Navbar from "./Navbar";
import ProtectedRoute from "./ProtectedRoute";
import { roleRoutes } from "../routes/roleRoutes";

import Setup from "../pages/Setup";
import Unauthorized from "../pages/Unauthorized";

import Personal from "../pages/settings/component/personalSettings";
import Company from "../pages/settings/component/companyDetails";
import Email from "../pages/settings/component/emailPage";
import Notifications from "../pages/settings/component/notificaionsSettings";

function App() {
    return (
        <Router>
            <Routes>

                {/* PUBLIC LANDING PAGE */}
                <Route path="/" element={<LandingPage />} />

                {/* LOGIN */}
                <Route path="/login" element={<Login />} />

                {/* SETUP */}
                <Route path="/setup" element={<Setup />} />

                {/* UNAUTHORIZED */}
                <Route
                    path="/unauthorized"
                    element={<Unauthorized />}
                />

                {/* PROTECTED ROUTES */}
                <Route element={<Navbar />}>

                    {roleRoutes.map((route, index) => (
                        <Route
                            key={index}
                            {...route}
                        />
                    ))}

                    {/* SETTINGS */}
                    <Route
                        path="/settings/personal"
                        element={
                            <ProtectedRoute>
                                <Personal />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/settings/company"
                        element={
                            <ProtectedRoute>
                                <Company />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/settings/email"
                        element={
                            <ProtectedRoute>
                                <Email />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/settings/notifications"
                        element={
                            <ProtectedRoute>
                                <Notifications />
                            </ProtectedRoute>
                        }
                    />

                </Route>

            </Routes>
        </Router>
    );
}

export default App;