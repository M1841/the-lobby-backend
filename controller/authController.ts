// Third-Party Modules
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Internal Modules
import User from "../model/User";

interface UserPayload {
    username: string;
}

// function for handling user authentication
const handleLogin = async (req: Request, res: Response) => {
    const cookies = req.cookies;
    const { username, email, password } = req.body;
    if ((!username && !email) || !password) {
        // send a "Bad Request" status and a descriptive message
        res.status(400).json({
            message: "Missing required data",
        });
    }

    // check the user with the provided username or email doesn't exist
    const criteria = username ? { username } : { email };
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
            : foundUser.refreshToken.filter((token) => token !== cookies.jwt);

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
    } else {
        // send an "Unauthorized" status
        res.sendStatus(401);
    }
};

export default { handleLogin };
