// Third-Party Modules
import express from "express";
const router = express.Router();

// Internal Modules
import refreshController from "../controller/refreshController";

// [ more info in ../controllers/refreshController ]
router.get("/", refreshController.handleRefresh);

export default router;
