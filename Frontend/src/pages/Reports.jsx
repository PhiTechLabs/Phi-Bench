    import React from "react";
    import usePermissions from "../hooks/usePermission";
    import ComingSoon from "../components/ComingSoon";
    import { BarChart3 } from "lucide-react";

    import {
    MODULES,
    ACTIONS,
    } from "./settings/constants/permissions";

    const Reports = () => {
    const { can } = usePermissions();
    const canView = can(MODULES.REPORT, ACTIONS.VIEW);

    if (!canView) {
        return (
        <div className="p-10 text-red-500">
            Access Denied
        </div>
        );
    }

    return (
        <ComingSoon
        icon={BarChart3}
        title="Reports are Taking Shape"
        subtitle="We're crafting a powerful reporting experience with deeper insights, smarter filtering, and meaningful analytics."
        />
    );
    };

    export default Reports;