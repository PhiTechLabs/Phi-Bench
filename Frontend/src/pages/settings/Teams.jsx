import React, {
    useEffect,
    useState,
} from "react";

import BackButton from "../../reusable/BackButton";

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

    return (
        <div className="p-6">

            <BackButton to="/settings" />

            <div className="flex justify-between items-center mt-4">

                <div>
                    <h1 className="text-3xl font-bold text-slate-800">
                        Teams
                    </h1>

                    <p className="text-slate-500 mt-1">
                        Manage recruitment teams
                    </p>
                </div>

                <button
                    onClick={() =>
                        setShowModal(true)
                    }
                    className="
                        px-4 py-2
                        bg-blue-700
                        text-white
                        rounded-lg
                    "
                >
                    + Create Team
                </button>

            </div>

            <div className="mt-6 bg-white rounded-xl border border-slate-200 overflow-hidden">

                {loading ? (

                    <div className="p-8 text-center">
                        Loading...
                    </div>

                ) : teams.length === 0 ? (

                    <div className="p-8 text-center text-slate-500">
                        No teams found
                    </div>

                ) : (

                    <table className="w-full">

                        <thead className="bg-slate-50 border-b">

                            <tr>

                                <th className="text-left p-4">
                                    Team
                                </th>

                                <th className="text-left p-4">
                                    Branch
                                </th>

                                <th className="text-left p-4">
                                    Team Lead
                                </th>

                                <th className="text-left p-4">
                                    Members
                                </th>

                                <th className="text-left p-4">
                                    Actions
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {teams.map(
                                (team) => (
                                    <tr
                                        key={team._id}
                                        className="border-b"
                                    >
                                        <td className="p-4">
                                            <div>
                                                <p className="font-medium">
                                                    {
                                                        team.name
                                                    }
                                                </p>

                                                <p className="text-xs text-gray-400">
                                                    {
                                                        team.description
                                                    }
                                                </p>
                                            </div>
                                        </td>

                                        <td className="p-4">
                                            {
                                                team
                                                    .branchId
                                                    ?.name
                                            }
                                        </td>

                                        <td className="p-4">
                                            {
                                                team
                                                    .teamLead
                                                    ?.username
                                            }
                                        </td>

                                        <td className="p-4">
                                            {
                                                team
                                                    .members
                                                    ?.length
                                            }
                                        </td>

                                        <td className="p-4">

                                            <div className="flex gap-2">

                                                <button
                                                    onClick={() => {
                                                        setSelectedTeam(team);
                                                        setShowModal(true);
                                                    }}
                                                    className="text-blue-600"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            team._id
                                                        )
                                                    }
                                                    className="text-red-600"
                                                >
                                                    Delete
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