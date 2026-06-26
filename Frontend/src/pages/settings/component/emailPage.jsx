    import ComingSoon from "../../../components/comingSoon";
    import { Mail } from "lucide-react";
    import BackButton from "../../../reusable/BackButton";

    export default function Email() {
    return (
        <>
        <BackButton/>
        <ComingSoon
        icon={Mail}
        title="Email Settings are Taking Shape"
        subtitle="Configure email templates, delivery preferences, and communication settings with greater flexibility."
        />
        </>
    );
    }