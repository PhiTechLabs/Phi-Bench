    import React from "react";
    import {hasPermission} from "../utils/permissions";
    import { getCurrentUser } from "../utils/auth";
    import { PERMISSIONS } from "../pages/settings/constants/permissions";

    const user = getCurrentUser();
    const canView = hasPermission(user, PERMISSIONS.REPORTS_VIEW);

    const Reports = () => {
        if (!canView) {
            return <div className="p-10 text-red-500">Access Denied</div>;
        }
    return (
        <div className="p-6 bg-gray-100 min-h-screen">

        <h1 className="text-2xl font-semibold mb-6">Reports</h1>

        <div className="grid md:grid-cols-3 gap-4">

            <Card title="Total Clients" value={JSON.parse(localStorage.getItem("clients"))?.length || 0} />
            <Card title="Total Jobs" value={JSON.parse(localStorage.getItem("jobs"))?.length || 0} />
            <Card title="Total Submissions" value={JSON.parse(localStorage.getItem("submissions"))?.length || 0} />

        </div>

        </div>
    );
    };

    const Card = ({ title, value }) => (
    <div className="bg-white p-4 rounded-xl shadow">
        <p className="text-gray-500 text-sm">{title}</p>
        <h2 className="text-xl font-semibold">{value}</h2>
    </div>
    );

    export default Reports;