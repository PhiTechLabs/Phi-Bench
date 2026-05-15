// ─── NO ROLE PREFIX IN URLS ───────────────────────────────────────────────────
// This hook previously returned role-based prefixes like "/superadmin" or "/admin"
// Now it returns an empty string so all URLs are role-agnostic
const useRoleBase = () => {
    return "";
};

export default useRoleBase;