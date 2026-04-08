    // App.jsx
    import React from "react";
    import { BrowserRouter, Routes, Route } from "react-router";
    import Login from "../pages/Login";

    export default function App() {
    return (
        <BrowserRouter>
        <Routes>
            <Route path="/" element={<Login />} />
        </Routes>
        </BrowserRouter>
    );
    }
