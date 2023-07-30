// Third-Party Modules
import { Request, Response, NextFunction } from "express";

// Internal Modules
import allowedOrigins from "../config/allowedOrigins";

// set up response headers to satisfy CORS requirements
const setCorsHeaders = (req: Request, res: Response, next: NextFunction) => {
    if (allowedOrigins.includes(req.headers.origin as string)) {
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader(
            "Access-Control-Allow-Origin",
            req.headers.origin as string
        );
    }
    next();
};

export default setCorsHeaders;
