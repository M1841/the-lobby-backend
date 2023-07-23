// Third-Party Modules
import { Request, Response } from "express";

// Internal Modules
import User from "../model/User";

// function for handling user logout
const handleLogout = async (req: Request, res: Response) => {
    // DELETE THE ACCESS TOKEN ON THE FRONTEND FIRST
    // check if the cookies don't contain a refresh token
    const cookies = req.cookies;
    if (!cookies?.jwt) {
        // send a "No Content" status
        return res.sendStatus(204);
    }

    const refreshToken = cookies.jwt;

    // check the user with the provided refresh token doesn't exist
    const foundUser = await User.findOne({ refreshToken }).exec();
    if (!foundUser) {
        // BEFORE DEPLOYMENT: add secure:true
        res.clearCookie("jwt", { httpOnly: true, sameSite: "none" });

        // send a "No Content" status
        return res.sendStatus(204);
    }

    // remove the refresh token from the database
    foundUser.refreshToken = foundUser.refreshToken.filter(
        (token) => token !== refreshToken
    );
    const result = await foundUser.save();

    // BEFORE DEPLOYMENT: add secure:true
    res.clearCookie("jwt", { httpOnly: true, sameSite: "none" });

    // send a "No Content" status
    return res.sendStatus(204);
};

export default { handleLogout };
