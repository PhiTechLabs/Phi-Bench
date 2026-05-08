// ─── ROLE-BASED ROUTING PREFIX ────────────────────────────────────────────────
// Returns the URL prefix based on the logged-in user's role.
// Examples: superAdmin → "/superadmin", admin → "/admin"
const useRoleBase = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const role = user?.role === "superAdmin" ? "superadmin" : user?.role;
    return `/${role}`;
};

export default useRoleBase;