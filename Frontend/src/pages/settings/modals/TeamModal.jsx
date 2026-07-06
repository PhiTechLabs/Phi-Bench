import React, {
    useEffect,
    useState,
} from "react";

import axiosInstance from "../../../api/axiosInstance";

import { RxCross2 } from "react-icons/rx";
import {
    FiUsers,
    FiFileText,
    FiMapPin,
    FiUserCheck,
} from "react-icons/fi";
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

                    await updateTeam(
                        team._id,
                        form
                    );

                    } else {

                        await createTeam(
                            form
                        );

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
                z-999
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
                    max-w-md
                    max-h-[70vh]
                    shadow-xl
                    overflow-hidden
                    flex
                    flex-col
                "
            >

                {/* Header */}

                <div className="
                    flex
                    justify-between
                    items-start
                    p-6
                    pb-4
                    border-b
                    border-gray-100
                ">

                    <div>

                        <h2
                            className="
                                text-xl
                                font-bold
                                text-gray-900
                            "
                        >
                            {isEdit
                                ? "Edit Team"
                                : "Create Team"}
                        </h2>

                        <p
                            className="
                                text-sm
                                text-gray-400
                                mt-1
                            "
                        >
                            {isEdit
                                ? "Update the team details below"
                                : "Fill in the details to add a new team"}
                        </p>

                    </div>

                    <button
                        onClick={onClose}
                        className="
                            text-gray-400
                            hover:text-gray-600
                            transition-colors
                            mt-1
                        "
                    >
                        <RxCross2
                            size={20}
                        />
                    </button>

                </div>

                {/* Body */}

                <div
                    className="
                        p-6
                        space-y-4
                        overflow-y-auto
                    "
                >

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

                        <label
                            className="
                                block
                                text-sm
                                font-medium
                                text-gray-700
                                mb-1.5
                            "
                        >
                            Team Name
                        </label>

                        <div className="relative">

                            <FiUsers
                                className="
                                    absolute
                                    left-3
                                    top-1/2
                                    -translate-y-1/2
                                    text-gray-400
                                "
                                size={16}
                            />

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
                                placeholder="Enter team name"
                                className="
                                    w-full
                                    border
                                    border-gray-200
                                    rounded-xl
                                    pl-10
                                    pr-3
                                    py-2.5
                                    text-sm
                                    outline-none
                                    focus:border-blue-500
                                    focus:ring-1
                                    focus:ring-blue-500
                                    transition-colors
                                "
                            />

                        </div>

                    </div>

                    {/* Description */}

                    <div>

                        <label
                            className="
                                block
                                text-sm
                                font-medium
                                text-gray-700
                                mb-1.5
                            "
                        >
                            Description
                        </label>

                        <div className="relative">

                            <FiFileText
                                className="
                                    absolute
                                    left-3
                                    top-3
                                    text-gray-400
                                "
                                size={16}
                            />

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
                                placeholder="Enter description"
                                rows={3}
                                className="
                                    w-full
                                    border
                                    border-gray-200
                                    rounded-xl
                                    pl-10
                                    pr-3
                                    py-2.5
                                    text-sm
                                    outline-none
                                    focus:border-blue-500
                                    focus:ring-1
                                    focus:ring-blue-500
                                    transition-colors
                                    resize-none
                                "
                            />

                        </div>

                    </div>

                    {/* Branch */}

                    <div>

                        <label
                            className="
                                block
                                text-sm
                                font-medium
                                text-gray-700
                                mb-1.5
                            "
                        >
                            Branch
                        </label>

                        <div className="relative">

                            <FiMapPin
                                className="
                                    absolute
                                    left-3
                                    top-1/2
                                    -translate-y-1/2
                                    text-gray-400
                                "
                                size={16}
                            />

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
                                    border-gray-200
                                    rounded-xl
                                    pl-10
                                    pr-3
                                    py-2.5
                                    text-sm
                                    outline-none
                                    focus:border-blue-500
                                    focus:ring-1
                                    focus:ring-blue-500
                                    transition-colors
                                    appearance-none
                                    bg-white
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

                    </div>

                    {/* Team Lead */}

                    <div>

                        <label
                            className="
                                block
                                text-sm
                                font-medium
                                text-gray-700
                                mb-1.5
                            "
                        >
                            Team Lead
                        </label>

                        <div className="relative">

                            <FiUserCheck
                                className="
                                    absolute
                                    left-3
                                    top-1/2
                                    -translate-y-1/2
                                    text-gray-400
                                "
                                size={16}
                            />

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
                                    border-gray-200
                                    rounded-xl
                                    pl-10
                                    pr-3
                                    py-2.5
                                    text-sm
                                    outline-none
                                    focus:border-blue-500
                                    focus:ring-1
                                    focus:ring-blue-500
                                    transition-colors
                                    appearance-none
                                    bg-white
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

                    </div>

                    {/* Members */}

                    <div>

                        <label
                            className="
                                block
                                text-sm
                                font-medium
                                text-gray-700
                                mb-1.5
                            "
                        >
                            Members
                        </label>

                        <div
                            className="
                                max-h-40
                                overflow-y-auto
                                border
                                border-gray-200
                                rounded-xl
                                p-3
                                space-y-0.5
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
                                            gap-2.5
                                            py-1.5
                                            px-1
                                            rounded-lg
                                            hover:bg-gray-50
                                            cursor-pointer
                                            transition-colors
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
                                            className="
                                                w-4
                                                h-4
                                                rounded
                                                border-gray-300
                                                text-blue-600
                                                focus:ring-blue-500
                                            "
                                        />

                                        <span
                                            className="
                                                text-sm
                                                text-gray-700
                                            "
                                        >
                                            {
                                                user.username
                                            }
                                        </span>

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
                        gap-3
                        p-6
                        pt-4
                        border-t
                        border-gray-100
                    "
                >

                    <button
                        onClick={onClose}
                        className="
                            px-4
                            py-2.5
                            border
                            border-gray-200
                            rounded-xl
                            text-sm
                            font-medium
                            text-gray-600
                            hover:bg-gray-50
                            transition-colors
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
                            py-2.5
                            bg-blue-700
                            hover:bg-blue-800
                            disabled:opacity-60
                            text-white
                            rounded-xl
                            text-sm
                            font-medium
                            transition-colors
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