// Third-Party Modules
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Internal Modules
import User from "../models/User";

// function that checks the access token before allowing any other operations
const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
    // check if there's no authorization header or no user ID
    const authHeader =
        req.headers.authorization || (req.headers.Authorization as string);
    if (!authHeader?.startsWith("Bearer ")) {
        // 401 Unauthorized
        return res.status(401).send("Missing access token");
    }

    // get the accesst token from the header
    const token = authHeader.split(" ")[1];

    try {
        // check the token against the secret
        jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET as string,
            async (err: unknown, decoded: any) => {
                // check if there's a valid user ID encoded in the token
                if (
                    decoded?.userID &&
                    mongoose.Types.ObjectId.isValid(decoded?.userID)
                ) {
                    // check if there is a user with such ID
                    const foundUser = await User.findById(decoded.userID);
                    if (foundUser) {
                        // send the username & ID to the next functions
                        req.body.currentUserID = decoded.userID;
                        req.body.currentUsername = foundUser.username;
                        if (err) {
                            // 403 Forbidden
                            return res.status(403).json(err);
                        }
                        next();
                    }
                } else {
                    // 401 Unauthorized
                    return res.status(401).send("Invalid access token");
                }
            }
        );
    } catch (err: unknown) {
        // 500 Internal Server Error
        res.status(500).json(err);
    }
};

export default verifyJWT;
