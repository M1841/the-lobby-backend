// Third-Party Modules
import { Request, Response, NextFunction } from "express";

// Internal Modules
import logger from "../services/logger";

// specialised logger for requests
const reqLogger = (req: Request, res: Response, next: NextFunction) => {
    const message = `${req.method} | ${req.headers.origin} | ${req.url}`;
    const file = "reqLog.txt";
    logger(message, file);

    next();
};

// specialised logger for errors
const errLogger = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const message = `${err.name} | ${err.message}`;
    const file = "errLog.txt";
    logger(message, file);

    console.error(err.stack);
    res.status(500).send(err.message);

    next();
};

export { reqLogger, errLogger };
