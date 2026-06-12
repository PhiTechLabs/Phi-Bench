import React, {
    useEffect,
    useState,
} from "react";

import axiosInstance from "../../../api/axiosInstance";

import { RxCross2 } from "react-icons/rx";
import {
    createTeam,
    updateTeam,
} from "../../../api/teamsApi";

export default function TeamModal({
    open,
    team,
    onClose,
    onSuccess,
}) {

    const isEdit = !!team;

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [branches, setBranches] =
        useState([]);

    const [users, setUsers] =
        useState([]);

    const [form, setForm] =
        useState({
            name: "",
            description: "",
            branchId: "",
            teamLead: "",
            members: [],
        });

    useEffect(() => {

        if (!open) return;

        const loadData =
            async () => {

                try {

                    const [
                        branchesRes,
                        usersRes,
                    ] = await Promise.all([
                        axiosInstance.get(
                            "/branches"
                        ),
                        axiosInstance.get(
                            "/auth/users"
                        ),
                    ]);

                    setBranches(
                        branchesRes.data
                            .branches || []
                    );

                    setUsers(
                        usersRes.data
                            .users || []
                    );

                } catch (error) {
                    console.error(error);
                }

            };

        loadData();

    }, [open]);

    useEffect(() => {

        if (!team) return;

        setForm({
            name: team.name || "",
            description: team.description || "",
            branchId: team.branchId?._id || "",
            teamLead: team.teamLead?._id || "",
            members:
                team.members?.map(
                    (member) => member._id
                ) || [],
        });

    }, [team]);

    useEffect(() => {

        if (!open || team) return;

        setForm({
            name: "",
            description: "",
            branchId: "",
            teamLead: "",
            members: [],
        });

    }, [open, team]);

    const handleMemberChange =
        (userId) => {

            const exists =
                form.members.includes(
                    userId
                );

            if (exists) {

                setForm((prev) => ({
                    ...prev,
                    members:
                        prev.members.filter(
                            (id) =>
                                id !== userId
                        ),
                }));

            } else {

                setForm((prev) => ({
                    ...prev,
                    members: [
                        ...prev.members,
                        userId,
                    ],
                }));

            }

        };

    const handleSubmit =
        async () => {

            if (!form.name.trim()) {
                return setError(
                    "Team name is required"
                );
            }

            if (!form.branchId) {
                return setError(
                    "Branch is required"
                );
            }

            try {

                setLoading(true);

                if (isEdit) {

                    await axiosInstance.put(
                        `/teams/${team._id}`,
                        form
                    );

                } else {

                    if (isEdit) {

                        await updateTeam(
                            team._id,
                            form
                        );

                    } else {

                        await createTeam(
                            form
                        );

                    }

                }

                onSuccess?.(
                    isEdit
                        ? "Team updated successfully"
                        : "Team created successfully",
                    "success"
                );

                onClose();

            } catch (error) {

                setError(
                    error.response?.data
                        ?.message ||
                        "Failed to create team"
                );

            } finally {

                setLoading(false);

            }

        };

    if (!open) return null;

    return (

        <div
            className="
                fixed
                inset-0
                bg-black/50
                z-[999]
                flex
                items-center
                justify-center
                p-4
            "
        >

            <div
                className="
                    bg-white
                    rounded-2xl
                    w-full
                    max-w-xl
                    shadow-xl
                    overflow-hidden
                "
            >

                {/* Header */}

                <div className="
                    flex
                    justify-between
                    items-center
                    p-5
                    border-b
                ">

                    <h2
                        className="
                            text-xl
                            font-semibold
                        "
                    >
                        {isEdit
                            ? "Edit Team"
                            : "Create Team"}
                    </h2>

                    <button
                        onClick={onClose}
                    >
                        <RxCross2 />
                    </button>

                </div>

                {/* Body */}

                <div className="p-5 space-y-4">

                    {error && (

                        <div
                            className="
                                bg-red-50
                                border
                                border-red-200
                                text-red-600
                                px-3
                                py-2
                                rounded-lg
                                text-sm
                            "
                        >
                            {error}
                        </div>

                    )}

                    {/* Team Name */}

                    <div>

                        <label className="block text-sm mb-1">
                            Team Name
                        </label>

                        <input
                            value={form.name}
                            onChange={(e) =>
                                setForm(
                                    (prev) => ({
                                        ...prev,
                                        name:
                                            e.target.value,
                                    })
                                )
                            }
                            className="
                                w-full
                                border
                                rounded-lg
                                px-3
                                py-2
                            "
                        />

                    </div>

                    {/* Description */}

                    <div>

                        <label className="block text-sm mb-1">
                            Description
                        </label>

                        <textarea
                            value={
                                form.description
                            }
                            onChange={(e) =>
                                setForm(
                                    (prev) => ({
                                        ...prev,
                                        description:
                                            e.target.value,
                                    })
                                )
                            }
                            className="
                                w-full
                                border
                                rounded-lg
                                px-3
                                py-2
                            "
                        />

                    </div>

                    {/* Branch */}

                    <div>

                        <label className="block text-sm mb-1">
                            Branch
                        </label>

                        <select
                            value={
                                form.branchId
                            }
                            onChange={(e) =>
                                setForm(
                                    (prev) => ({
                                        ...prev,
                                        branchId:
                                            e.target.value,
                                    })
                                )
                            }
                            className="
                                w-full
                                border
                                rounded-lg
                                px-3
                                py-2
                            "
                        >

                            <option value="">
                                Select Branch
                            </option>

                            {branches.map(
                                (branch) => (
                                    <option
                                        key={
                                            branch._id
                                        }
                                        value={
                                            branch._id
                                        }
                                    >
                                        {
                                            branch.name
                                        }
                                    </option>
                                )
                            )}

                        </select>

                    </div>

                    {/* Team Lead */}

                    <div>

                        <label className="block text-sm mb-1">
                            Team Lead
                        </label>

                        <select
                            value={
                                form.teamLead
                            }
                            onChange={(e) =>
                                setForm(
                                    (prev) => ({
                                        ...prev,
                                        teamLead:
                                            e.target.value,
                                    })
                                )
                            }
                            className="
                                w-full
                                border
                                rounded-lg
                                px-3
                                py-2
                            "
                        >

                            <option value="">
                                Select Lead
                            </option>

                            {users.map(
                                (user) => (
                                    <option
                                        key={
                                            user._id
                                        }
                                        value={
                                            user._id
                                        }
                                    >
                                        {
                                            user.username
                                        }
                                    </option>
                                )
                            )}

                        </select>

                    </div>

                    {/* Members */}

                    <div>

                        <label className="block text-sm mb-2">
                            Members
                        </label>

                        <div
                            className="
                                max-h-44
                                overflow-y-auto
                                border
                                rounded-lg
                                p-3
                            "
                        >

                            {users.map(
                                (user) => (

                                    <label
                                        key={
                                            user._id
                                        }
                                        className="
                                            flex
                                            items-center
                                            gap-2
                                            py-1
                                        "
                                    >

                                        <input
                                            type="checkbox"
                                            checked={form.members.includes(
                                                user._id
                                            )}
                                            onChange={() =>
                                                handleMemberChange(
                                                    user._id
                                                )
                                            }
                                        />

                                        {
                                            user.username
                                        }

                                    </label>

                                )
                            )}

                        </div>

                    </div>

                </div>

                {/* Footer */}

                <div
                    className="
                        flex
                        justify-end
                        gap-2
                        p-5
                        border-t
                    "
                >

                    <button
                        onClick={onClose}
                        className="
                            px-4
                            py-2
                            border
                            rounded-lg
                        "
                    >
                        Cancel
                    </button>

                    <button
                        onClick={
                            handleSubmit
                        }
                        disabled={loading}
                        className="
                            px-4
                            py-2
                            bg-blue-700
                            text-white
                            rounded-lg
                        "
                    >
                        {
                            loading
                                ? isEdit
                                    ? "Updating..."
                                    : "Creating..."
                                : isEdit
                                    ? "Update Team"
                                    : "Create Team"
                        }
                    </button>

                </div>

            </div>

        </div>
    );
}