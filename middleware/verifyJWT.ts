// Third-Party Modules
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// function that checks the access token before allowing any other operations
const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
    // check if there's no authorization header or no user ID
    const authHeader =
        req.headers.authorization || (req.headers.Authorization as string);
    if (!authHeader?.startsWith("Bearer ")) {
        // send an "Unauthorized" status
        return res.sendStatus(401);
    }

    // get the accesst token from the header
    const token = authHeader.split(" ")[1];

    // check the token against the secret and run a function if successful
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET as string,
        (err: any, decoded: any) => {
            // disallow the request there's no user ID in the token or there are any other errors
            if (err || !decoded.userID) {
                // send a "Forbidden" status
                return res.sendStatus(403);
            }

            req.body.currentUserID = decoded.userID;

            next();
        }
    );
};

export default verifyJWT;
