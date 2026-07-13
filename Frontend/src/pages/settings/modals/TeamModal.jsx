import React, {
    useEffect,
    useState,
    useRef,
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

    const [leadSearch, setLeadSearch] = useState("");
    const [leadDropdownOpen, setLeadDropdownOpen] = useState(false);
    const leadDropdownRef = useRef(null);

    const [branchSearch, setBranchSearch] = useState("");
    const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
    const branchDropdownRef = useRef(null);

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

    useEffect(() => {

        const handleClickOutside = (e) => {

            if (
                leadDropdownRef.current &&
                !leadDropdownRef.current.contains(e.target)
            ) {
                setLeadDropdownOpen(false);
            }

            if (
                branchDropdownRef.current &&
                !branchDropdownRef.current.contains(e.target)
            ) {
                setBranchDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () =>
            document.removeEventListener("mousedown", handleClickOutside);

    }, []);

    useEffect(() => {

        if (!open) {
            setLeadSearch("");
            setLeadDropdownOpen(false);
            setBranchSearch("");
            setBranchDropdownOpen(false);
        }

    }, [open]);

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

                    <div ref={branchDropdownRef}>

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

                            {/* CLOSED CONTROL / SEARCH INPUT */}
                            <div className="relative">

                                <FiMapPin
                                    className="
                                        absolute
                                        left-3
                                        top-1/2
                                        -translate-y-1/2
                                        text-gray-400
                                        z-10
                                    "
                                    size={16}
                                />

                                <input
                                    type="text"
                                    value={
                                        branchDropdownOpen
                                            ? branchSearch
                                            : (branches.find(
                                                (b) => b._id === form.branchId
                                            )?.name || "")
                                    }
                                    onFocus={() => {
                                        setBranchDropdownOpen(true);
                                        setBranchSearch("");
                                    }}
                                    onChange={(e) =>
                                        setBranchSearch(e.target.value)
                                    }
                                    placeholder="Select Branch"
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
                                        bg-white
                                        cursor-pointer
                                    "
                                />

                            </div>

                            {/* DROPDOWN LIST */}
                            {branchDropdownOpen && (

                                <div
                                    className="
                                        absolute
                                        z-20
                                        mt-1.5
                                        w-full
                                        bg-white
                                        border
                                        border-gray-200
                                        rounded-xl
                                        shadow-lg
                                        max-h-48
                                        overflow-y-auto
                                        py-1
                                    "
                                >

                                    {branches
                                        .filter((branch) =>
                                            branch.name
                                                ?.toLowerCase()
                                                .includes(
                                                    branchSearch.toLowerCase()
                                                )
                                        )
                                        .map((branch) => (

                                            <div
                                                key={branch._id}
                                                onClick={() => {
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        branchId: branch._id,
                                                    }));
                                                    setBranchDropdownOpen(false);
                                                    setBranchSearch("");
                                                }}
                                                className={`
                                                    px-3.5
                                                    py-2
                                                    text-sm
                                                    cursor-pointer
                                                    transition-colors
                                                    hover:bg-blue-50
                                                    ${
                                                        form.branchId === branch._id
                                                            ? "bg-blue-50 text-blue-700 font-medium"
                                                            : "text-gray-700"
                                                    }
                                                `}
                                            >
                                                {branch.name}
                                            </div>
                                        ))}

                                    {branches.filter((branch) =>
                                        branch.name
                                            ?.toLowerCase()
                                            .includes(branchSearch.toLowerCase())
                                    ).length === 0 && (

                                        <div className="px-3.5 py-2 text-sm text-gray-400">
                                            No branches found
                                        </div>
                                    )}

                                </div>
                            )}

                        </div>

                    </div>


                    {/* Team Lead */}


                    <div ref={leadDropdownRef}>

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

                            {/* CLOSED CONTROL / SEARCH INPUT */}
                            <div className="relative">

                                <FiUserCheck
                                    className="
                                        absolute
                                        left-3
                                        top-1/2
                                        -translate-y-1/2
                                        text-gray-400
                                        z-10
                                    "
                                    size={16}
                                />

                                <input
                                    type="text"
                                    value={
                                        leadDropdownOpen
                                            ? leadSearch
                                            : (users.find(
                                                (u) => u._id === form.teamLead
                                            )?.username || "")
                                    }
                                    onFocus={() => {
                                        setLeadDropdownOpen(true);
                                        setLeadSearch("");
                                    }}
                                    onChange={(e) =>
                                        setLeadSearch(e.target.value)
                                    }
                                    placeholder="Select team leader"
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
                                        bg-white
                                        cursor-pointer
                                    "
                                />

                            </div>

                            {/* DROPDOWN LIST */}
                            {leadDropdownOpen && (

                                <div
                                    className="
                                        absolute
                                        z-20
                                        mt-1.5
                                        w-full
                                        bg-white
                                        border
                                        border-gray-200
                                        rounded-xl
                                        shadow-lg
                                        max-h-48
                                        overflow-y-auto
                                        py-1
                                    "
                                >

                                    {users
                                        .filter((user) =>
                                            user.username
                                                ?.toLowerCase()
                                                .includes(
                                                    leadSearch.toLowerCase()
                                                )
                                        )
                                        .map((user) => (

                                            <div
                                                key={user._id}
                                                onClick={() => {
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        teamLead: user._id,
                                                    }));
                                                    setLeadDropdownOpen(false);
                                                    setLeadSearch("");
                                                }}
                                                className={`
                                                    px-3.5
                                                    py-2
                                                    text-sm
                                                    cursor-pointer
                                                    transition-colors
                                                    hover:bg-blue-50
                                                    ${
                                                        form.teamLead === user._id
                                                            ? "bg-blue-50 text-blue-700 font-medium"
                                                            : "text-gray-700"
                                                    }
                                                `}
                                            >
                                                {user.username}
                                            </div>
                                        ))}

                                    {users.filter((user) =>
                                        user.username
                                            ?.toLowerCase()
                                            .includes(leadSearch.toLowerCase())
                                    ).length === 0 && (

                                        <div className="px-3.5 py-2 text-sm text-gray-400">
                                            No users found
                                        </div>
                                    )}

                                </div>
                            )}

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