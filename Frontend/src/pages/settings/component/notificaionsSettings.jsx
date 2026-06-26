    import ComingSoon from "../../../components/comingSoon";
    import { Bell } from "lucide-react";
    import BackButton from "../../../reusable/BackButton";

    export default function Notifications() {
    return (
        <>
        <BackButton/>
        <ComingSoon
        icon={Bell}
        title="Notification Center is Taking Shape"
        subtitle="Customize alerts, reminders, and notification preferences across your entire workspace."
        />
        </>
    );
    }