// Third-Party Modules
import express from "express";
import { Request, Response } from "express";
const router = express.Router();

router.get("/", (req: Request, res: Response) =>
    // 302 Found
    res.status(302).redirect("https://github.com/M1841/the-lobby-backend")
);

export default router;
