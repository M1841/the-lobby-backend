// Third-Party Modules
import express, { Request, Response } from "express";
const router = express.Router();

// Internal Modules
import File from "../../models/File";

router.get("/:id", async (req: Request, res: Response) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) {
            // 404 Not Found
            return res.status(404).send("File doesn't exist");
        }
        res.contentType(file.mimetype);
        res.status(200).send(file.data);
    } catch (err: unknown) {
        // 500 Internal Server Error
        return res.status(500).json(err);
    }
});

export default router;
