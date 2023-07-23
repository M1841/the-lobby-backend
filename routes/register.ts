// Third-Party Modules
import express from "express";
const router = express.Router();

// Internal Module
import registerController from "../controller/registerController";

// [ info at ../controllers/registerController ]
router.post("/", registerController.handleNewUser);

export default router;
