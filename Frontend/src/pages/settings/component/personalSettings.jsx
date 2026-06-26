    import ComingSoon from "../../../components/comingSoon";
    import { User } from "lucide-react";
    import BackButton from "../../../reusable/BackButton";

    export default function Personal() {
    return (
        <>
        <BackButton/>
        <ComingSoon
        icon={User}
        title="Personal Settings are Taking Shape"
        subtitle="We're creating a more personalized experience with profile management, account preferences, and customization options."
        />
        </>
    );
    }