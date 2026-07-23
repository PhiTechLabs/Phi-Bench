import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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

                    {/* Dynamic Role Routes */}
                    {roleRoutes.map((route, index) => (
                        <Route key={index} {...route} />
                    ))}

                    {/* Settings Pages */}
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