// Third-Party Modules
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Internal Modules
import User from "../models/User";

const handleLogin = async (req: Request, res: Response) => {
    const cookies = req.cookies;
    const { username, email, password } = req.body;
    if ((!username && !email) || !password) {
        let missingFields: {
            username?: string;
            email?: string;
            password?: string;
        } = {};
        if (!username && !email) {
            missingFields.username = "missing";
            missingFields.email = "missing";
        }
        if (!password) missingFields.password = "missing";
        // 400 Bad Request
        return res.status(400).json(missingFields);
    }

    // check the if user with the provided username or email doesn't exist
    const criteria = username ? { username } : { email };
    try {
        const foundUser = await User.findOne(criteria).exec();
        if (!foundUser) {
            // 404 Not Found
            return res.status(404).send("User does not exist");
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
                { expiresIn: "1h" }
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

            // 200 OK
            return res.status(200).json({ accessToken });
        } else {
            // 401 Unauthorized
            return res.status(401).send("Incorrect password");
        }
    } catch (err: unknown) {
        // 500 Internal Server Error
        return res.status(500).json(err);
    }
};

const handleLogout = async (req: Request, res: Response) => {
    // DELETE THE ACCESS TOKEN ON THE FRONTEND AS WELL
    // check if the cookies don't contain a refresh token
    const cookies = req.cookies;
    if (!cookies?.jwt) {
        // 204 No Content
        return res.sendStatus(204);
    }

    const refreshToken = cookies.jwt;

    try {
        // check the user with the provided refresh token doesn't exist
        const foundUser = await User.findOne({ refreshToken }).exec();
        if (!foundUser) {
            // BEFORE DEPLOYMENT: add secure:true
            res.clearCookie("jwt", { httpOnly: true, sameSite: "none" });

            // 204 No Content
            return res.sendStatus(204);
        }

        // remove the refresh token from the database
        foundUser.refreshToken = foundUser.refreshToken.filter(
            (token) => token !== refreshToken
        );
        await foundUser.save();

        // BEFORE DEPLOYMENT: add secure:true
        res.clearCookie("jwt", { httpOnly: true, sameSite: "none" });

        // 204 No Content
        return res.sendStatus(204);
    } catch (err: unknown) {
        // 500 Internal Server Error
        return res.status(500).json(err);
    }
};

const handleRefresh = async (req: Request, res: Response) => {
    // check if the cookies don't contain a refresh token
    const cookies = req.cookies;
    if (!cookies?.jwt) {
        // 401 Unauthorized
        return res.status(401).send("Missing refresh token");
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
                        // 403 Forbidden
                        return res.status(403).send("Invalid refresh token");
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
            // 403 Forbidden
            return res.status(403).send("Invalid refresh token");
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
                    { expiresIn: "1h" }
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
                return res.status(200).json({ accessToken });
            }
        );
    } catch (err: unknown) {
        // 500 Internal Server Error
        return res.status(500).json(err);
    }
};

export { handleLogin, handleLogout, handleRefresh };
