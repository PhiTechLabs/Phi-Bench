import { PERMISSIONS } from "../config/permissions.js";

export const requirePermission =
    (requiredPermission) =>
    (req, res, next) => {

        try {

            const role =
                req.user?.role;

            if (!role) {

                return res.status(401).json({
                    message:
                        "Unauthorized",
                });
            }

            // ───────────────── SUPER ADMIN ACCESS ─────────────────
            if (
                role.name ===
                "super_admin"
            ) {

                return next();
            }

            // ───────────────── MAP PERMISSION TO MODULE + ACTION ─────────────────
            const permissionMap = {

                // JOB
                [PERMISSIONS.JOB_VIEW]: {
                    module: "job",
                    action: "view",
                },

                [PERMISSIONS.JOB_CREATE]: {
                    module: "job",
                    action: "add",
                },

                [PERMISSIONS.JOB_EDIT]: {
                    module: "job",
                    action: "edit",
                },

                [PERMISSIONS.JOB_DELETE]: {
                    module: "job",
                    action: "delete",
                },

                // CANDIDATE
                [PERMISSIONS.CANDIDATE_VIEW]:
                    {
                        module:
                            "candidate",
                        action:
                            "view",
                    },

                [PERMISSIONS.CANDIDATE_CREATE]:
                    {
                        module:
                            "candidate",
                        action:
                            "add",
                    },

                [PERMISSIONS.CANDIDATE_EDIT]:
                    {
                        module:
                            "candidate",
                        action:
                            "edit",
                    },

                [PERMISSIONS.CANDIDATE_DELETE]:
                    {
                        module:
                            "candidate",
                        action:
                            "delete",
                    },

                // CLIENT
                [PERMISSIONS.CLIENT_VIEW]:
                    {
                        module:
                            "clients",
                        action:
                            "view",
                    },

                [PERMISSIONS.CLIENT_CREATE]:
                    {
                        module:
                            "clients",
                        action:
                            "add",
                    },

                [PERMISSIONS.CLIENT_EDIT]:
                    {
                        module:
                            "clients",
                        action:
                            "edit",
                    },

                [PERMISSIONS.CLIENT_DELETE]:
                    {
                        module:
                            "clients",
                        action:
                            "delete",
                    },

                // USER
                [PERMISSIONS.USER_VIEW]: {
                    module: "home",
                    action: "view",
                },

                // ROLE
                [PERMISSIONS.ROLE_VIEW]: {
                    module: "home",
                    action: "view",
                },

                // PERMISSION
                [PERMISSIONS.PERMISSION_VIEW]:
                    {
                        module:
                            "home",
                        action:
                            "view",
                    },

                [PERMISSIONS.PERMISSION_EDIT]:
                    {
                        module:
                            "home",
                        action:
                            "edit",
                    },
            };

            const config =
                permissionMap[
                    requiredPermission
                ];

            if (!config) {

                return next();
            }

            const modulePermissions =
                role
                    ?.modulePermissions?.[
                    config.module
                ];

            const allowed =
                modulePermissions?.[
                    config.action
                ];

            // ───────────────── DENY ACCESS ─────────────────
            if (
                !allowed ||
                allowed === "none"
            ) {

                return res.status(403).json({
                    message:
                        "Access denied",
                });
            }

            next();

        } catch (error) {

            return res.status(500).json({
                message: error.message,
            });
        }
    };