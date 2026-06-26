    import ComingSoon from "../../../components/comingSoon";
    import { Building2 } from "lucide-react";
    import BackButton from "../../../reusable/BackButton";

    export default function Company() {
    return (
        <>
        <BackButton/>
        <ComingSoon
        icon={Building2}
        title="Company Settings are Taking Shape"
        subtitle="Manage your organization's profile, branding, and workspace information from one centralized place."
        />
        </>
    );
    }