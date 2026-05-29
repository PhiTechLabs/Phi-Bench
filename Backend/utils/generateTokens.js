import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {

    return jwt.sign(

        {
            id: user._id,
            role: user.roleId?.name,
            permissions: user.roleId?.permissions || [],
        },

        process.env.JWT_SECRET,

        {
            expiresIn: "15m",
        }

    );
};
export const generateRefreshToken = (user) => {

    return jwt.sign(

        {
            id: user._id,
        },

        process.env.JWT_REFRESH_SECRET,

        {
            expiresIn: "7d",
        }

    );

};