// Core Node Modules
import path from "path";

// Third-Party Modules
import express, { Request, Response } from "express";
const router = express.Router();

router.get("/:fileName", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "..", "uploads", req.params.fileName));
});

export default router;
