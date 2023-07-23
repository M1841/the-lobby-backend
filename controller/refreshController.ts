// Third-Party Modules
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

// Internal Modules
import User from "../model/User";

const handleRefresh = async (req: Request, res: Response) => {
    // check if the cookies don't contain a refresh token
    const cookies = req.cookies;
    console.log(req);
    if (!cookies?.jwt) {
        // send a "Unauthorized" status
        return res.sendStatus(401);
    }

    const refreshToken = cookies.jwt;

    // BEFORE DEPLOYMENT: add secure:true
    res.clearCookie("jwt", { httpOnly: true, sameSite: "none" });

    const foundUser = await User.findOne({ refreshToken }).exec();

    // check if the refersh token is being reused
    if (!foundUser) {
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET as string,
            async (err: any, decoded: any) => {
                if (err) {
                    // send a "Forbidden" status
                    return res.sendStatus(403);
                }

                const hackedUser = await User.findOne({
                    username: decoded.username,
                }).exec();
                if (hackedUser) {
                    hackedUser.refreshToken = [];
                    const result = await hackedUser.save();
                }
            }
        );
        // send a "Forbidden" status
        return res.sendStatus(403);
    }

    const newRefreshTokenArray = foundUser.refreshToken.filter(
        (token) => token !== refreshToken
    );

    // check the token against the secret and run a function if successful
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET as string,
        async (err: any, decoded: any) => {
            if (err) {
                foundUser.refreshToken = [...newRefreshTokenArray];
                const result = await foundUser.save();
            }
            // check if there was an error or the the found user isn't the same as the one obtained by the verify function
            if (err || foundUser.username !== decoded.username) {
                // send a "Forbidden" status
                return res.sendStatus(403);
            }
            // set up access and refresh tokens
            const accessToken = jwt.sign(
                { username: decoded.username, userID: decoded.userID },
                process.env.ACCESS_TOKEN_SECRET as string,
                { expiresIn: "15m" }
            );
            const newRefreshToken = jwt.sign(
                { username: decoded.username, userID: decoded.userID },
                process.env.REFRESH_TOKEN_SECRET as string,
                { expiresIn: "1d" }
            );

            // add the refreshToken to the database
            foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
            const result = await foundUser.save();

            // save the current refresh token in the cookies
            // BEFORE DEPLOYMENT: add secure:true
            res.cookie("jwt", newRefreshToken, {
                httpOnly: true,
                sameSite: "none",
                maxAge: 24 * 60 * 60 * 1000,
            });

            // send back the access token
            res.json({ accessToken });
        }
    );
};

export default { handleRefresh };
