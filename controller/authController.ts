// Third-Party Modules
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Internal Modules
import User from "../model/User";

const handleLogin = async (req: Request, res: Response) => {
    const cookies = req.cookies;
    const { username, email, password } = req.body;
    if ((!username && !email) || !password) {
        // send a "Bad Request" status and a descriptive message
        res.status(400).json({
            message: "Missing required data",
        });
    }

    // check the if user with the provided username or email doesn't exist
    const criteria = username ? { username } : { email };
    try {
        const foundUser = await User.findOne(criteria).exec();
        if (!foundUser) {
            // send a "Unauthorized" status
            return res.sendStatus(401);
        }

        // compare the passwords
        const doesPasswordMatch = await bcrypt.compare(
            password,
            foundUser.password
        );
        if (doesPasswordMatch) {
            // set up access and refresh tokens
            const accessToken = jwt.sign(
                { username: foundUser.username, userID: foundUser._id },
                process.env.ACCESS_TOKEN_SECRET as string,
                { expiresIn: "15m" }
            );
            const newRefreshToken = jwt.sign(
                { username: foundUser.username, userID: foundUser._id },
                process.env.REFRESH_TOKEN_SECRET as string,
                { expiresIn: "1d" }
            );

            // fetch the other refresh tokens used by the user
            let newRefreshTokenArray: string[] = !cookies?.jwt
                ? foundUser.refreshToken
                : foundUser.refreshToken.filter(
                      (token) => token !== cookies.jwt
                  );

            // clear the refresh token from the cookies if it's invalid
            if (cookies?.jwt) {
                const refreshToken = cookies.jwt;
                const foundToken = await User.findOne({ refreshToken }).exec();
                if (!foundToken) {
                    newRefreshTokenArray = [];
                }
                // BEFORE DEPLOYMENT: add secure:true
                res.clearCookie("jwt", { httpOnly: true, sameSite: "none" });
            }

            // update the refresh tokens
            foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
            await foundUser.save();

            // save the current refresh token in the cookies
            // BEFORE DEPLOYMENT: add secure:true
            res.cookie("jwt", newRefreshToken, {
                httpOnly: true,
                sameSite: "none",
                maxAge: 24 * 60 * 60 * 1000,
            });

            // send back the access token
            res.json({ accessToken });
        } else {
            // send an "Unauthorized" status
            res.sendStatus(401);
        }
    } catch (err: unknown) {
        res.sendStatus(500).json(err);
    }
};

const handleLogout = async (req: Request, res: Response) => {
    // DELETE THE ACCESS TOKEN ON THE FRONTEND TOO
    // check if the cookies don't contain a refresh token
    const cookies = req.cookies;
    if (!cookies?.jwt) {
        // send a "No Content" status
        return res.sendStatus(204);
    }

    const refreshToken = cookies.jwt;

    try {
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
    } catch (err: unknown) {
        res.sendStatus(500).json(err);
    }
};

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

    try {
        const foundUser = await User.findOne({ refreshToken }).exec();

        // check if the refersh token is being reused
        if (!foundUser) {
            jwt.verify(
                refreshToken,
                process.env.REFRESH_TOKEN_SECRET as string,
                async (err: unknown, decoded: any) => {
                    if (err) {
                        // send a "Forbidden" status
                        return res.sendStatus(403);
                    }

                    const hackedUser = await User.findOne({
                        username: decoded.username,
                    }).exec();
                    if (hackedUser) {
                        hackedUser.refreshToken = [];
                        await hackedUser.save();
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
                    await foundUser.save();
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
                foundUser.refreshToken = [
                    ...newRefreshTokenArray,
                    newRefreshToken,
                ];
                await foundUser.save();

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
    } catch (err: unknown) {
        res.sendStatus(500).json(err);
    }
};

export { handleLogin, handleLogout, handleRefresh };
