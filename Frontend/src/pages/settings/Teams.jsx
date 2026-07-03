import React, {
    useEffect,
    useState,
} from "react";

import BackButton from "../../reusable/BackButton";

import {
    FiSearch,
    FiEdit2,
    FiTrash2,
} from "react-icons/fi";

import {
    getTeams,
    deleteTeam,
} from "../../api/teamsApi";
import TeamModal from "./modals/TeamModal";

export default function Teams() {
    const [teams, setTeams] = useState([]);

    const [selectedTeam, setSelectedTeam] =
    useState(null);

    const [showModal, setShowModal] =
    useState(false);

    const [loading, setLoading] =
        useState(true);

    const [search, setSearch] =
        useState("");

    const fetchTeams = async () => {
        try {
            const data =
                await getTeams();

            setTeams(
                data.teams || []
            );
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    const handleDelete =
        async (id) => {
            const confirmed =
                window.confirm(
                    "Delete this team?"
                );

            if (!confirmed) return;

            try {
                await deleteTeam(id);

                fetchTeams();
            } catch (error) {
                console.error(error);
            }
        };

        const handleSuccess = () => {
            fetchTeams();
            setShowModal(false);
            setSelectedTeam(null);
        };

    const filteredTeams =
        teams.filter((team) => {

            const query =
                search.toLowerCase();

            return (
                team.name
                    ?.toLowerCase()
                    .includes(query) ||
                team.branchId?.name
                    ?.toLowerCase()
                    .includes(query) ||
                team.teamLead?.username
                    ?.toLowerCase()
                    .includes(query)
            );

        });

    const getInitial =
        (name) =>
            name
                ? name
                    .charAt(0)
                    .toUpperCase()
                : "?";

    return (
        <div className="p-6">

            {/* Header */}

            <div className="flex justify-between items-start">

                <div className="flex items-center gap-4">

                    <BackButton to="/settings" />

                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            Teams
                        </h1>

                        <p className="text-sm text-slate-400 mt-0.5">
                            {teams.length}{" "}
                            {teams.length === 1
                                ? "team"
                                : "teams"}{" "}
                            total
                        </p>
                    </div>

                </div>

                <button
                    onClick={() =>
                        setShowModal(true)
                    }
                    className="
                        flex
                        items-center
                        gap-1.5
                        px-4 py-2.5
                        bg-blue-700
                        hover:bg-blue-800
                        text-white
                        text-sm
                        font-medium
                        rounded-xl
                        transition-colors
                    "
                >
                    + Create Team
                </button>

            </div>

            {/* Search */}

            <div className="relative mt-6 max-w-md">

                <FiSearch
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
                    value={search}
                    onChange={(e) =>
                        setSearch(
                            e.target.value
                        )
                    }
                    placeholder="Search by team, branch or lead..."
                    className="
                        w-full
                        border
                        border-slate-200
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
                    "
                />

            </div>

            {/* Table */}

            <div className="mt-4 bg-white rounded-xl border border-slate-200 overflow-hidden">

                {loading ? (

                    <div className="p-8 text-center text-slate-400 text-sm">
                        Loading...
                    </div>

                ) : filteredTeams.length === 0 ? (

                    <div className="p-8 text-center text-slate-400 text-sm">
                        No teams found
                    </div>

                ) : (

                    <table className="w-full">

                        <thead className="bg-slate-50 border-b border-slate-200">

                            <tr>

                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-12">
                                    #
                                </th>

                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                    Team
                                </th>

                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                    Branch
                                </th>

                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                    Team Lead
                                </th>

                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                    Members
                                </th>

                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                    Actions
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {filteredTeams.map(
                                (team, index) => (
                                    <tr
                                        key={team._id}
                                        className="
                                            border-b
                                            border-slate-100
                                            last:border-0
                                            hover:bg-slate-50
                                            transition-colors
                                        "
                                    >
                                        <td className="px-4 py-3.5 text-sm text-slate-400">
                                            {index + 1}
                                        </td>

                                        <td className="px-4 py-3.5">
                                            <div>
                                                <p className="font-medium text-sm text-slate-800">
                                                    {
                                                        team.name
                                                    }
                                                </p>

                                                {team.description && (
                                                    <p className="text-xs text-slate-400 mt-0.5">
                                                        {
                                                            team.description
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3.5">
                                            {team.branchId?.name ? (
                                                <span
                                                    className="
                                                        inline-flex
                                                        px-2.5
                                                        py-1
                                                        rounded-full
                                                        text-xs
                                                        font-medium
                                                        bg-blue-50
                                                        text-blue-700
                                                    "
                                                >
                                                    {
                                                        team.branchId.name
                                                    }
                                                </span>
                                            ) : (
                                                <span className="text-slate-300">
                                                    —
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-4 py-3.5">
                                            {team.teamLead?.username ? (
                                                <div className="flex items-center gap-2">

                                                    <div
                                                        className="
                                                            w-7
                                                            h-7
                                                            rounded-full
                                                            bg-blue-100
                                                            text-blue-700
                                                            text-xs
                                                            font-semibold
                                                            flex
                                                            items-center
                                                            justify-center
                                                        "
                                                    >
                                                        {getInitial(
                                                            team.teamLead
                                                                .username
                                                        )}
                                                    </div>

                                                    <span className="text-sm text-slate-700">
                                                        {
                                                            team.teamLead
                                                                .username
                                                        }
                                                    </span>

                                                </div>
                                            ) : (
                                                <span className="text-slate-300">
                                                    —
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-4 py-3.5">
                                            <span
                                                className="
                                                    inline-flex
                                                    px-2.5
                                                    py-1
                                                    rounded-full
                                                    text-xs
                                                    font-medium
                                                    bg-slate-100
                                                    text-slate-600
                                                "
                                            >
                                                {
                                                    team.members
                                                        ?.length || 0
                                                }
                                            </span>
                                        </td>

                                        <td className="px-4 py-3.5">

                                            <div className="flex gap-2">

                                                <button
                                                    onClick={() => {
                                                        setSelectedTeam(team);
                                                        setShowModal(true);
                                                    }}
                                                    title="Edit team"
                                                    className="
                                                        p-2
                                                        rounded-lg
                                                        bg-blue-50
                                                        text-blue-600
                                                        hover:bg-blue-100
                                                        transition-colors
                                                    "
                                                >
                                                    <FiEdit2 size={14} />
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            team._id
                                                        )
                                                    }
                                                    title="Delete team"
                                                    className="
                                                        p-2
                                                        rounded-lg
                                                        bg-red-50
                                                        text-red-600
                                                        hover:bg-red-100
                                                        transition-colors
                                                    "
                                                >
                                                    <FiTrash2 size={14} />
                                                </button>

                                            </div>

                                        </td>
                                    </tr>
                                )
                            )}

                        </tbody>

                    </table>

                )}

            </div>

            <TeamModal
                open={showModal}
                team={selectedTeam}
                onClose={() => {
                    setShowModal(false);
                    setSelectedTeam(null);
                }}
                onSuccess={handleSuccess}
            />

        </div>
    );
}