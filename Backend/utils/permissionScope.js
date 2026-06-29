import User from "../models/User.js";
import Team from "../models/team.js";

export const getAccessibleUserIds = async (
    user,
    permissionValue
) => {

    switch (permissionValue) {

        case "all":
            return null;

        case "own":
            return [user._id];

        case "reporting": {
            const directReports =
                await User.find({
                    managerId: user._id,
                }).select("_id");

            return directReports.map(
                (u) => u._id
            );
        }

        case "team": {

            const team =
                await Team.findOne({
                    $or: [
                        { teamLead: user._id },
                        { members: user._id },
                    ],
                });

            if (!team) {
                return [user._id];
            }

            return [
                team.teamLead,
                ...team.members,
            ];
        }

        case "hierarchy": {

            const users =
                await User.find({
                    managerId: user._id,
                }).select("_id");

            return [
                user._id,
                ...users.map(
                    (u) => u._id
                ),
            ];
        }

        default:
            return [];
    }
};