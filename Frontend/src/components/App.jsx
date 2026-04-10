import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import SuperAdmin from "../pages/SuperAdmin";
import Admin from "../pages/Admin";
import Client from "../pages/Client";

function App() {
    return (
        <Router>
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/superadmin" element={<SuperAdmin />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/client" element={<Client />} />
        </Routes>
        </Router>
    );
}

export default App;