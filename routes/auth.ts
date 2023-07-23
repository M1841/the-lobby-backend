// Third-Party Modules
import express from "express";
const router = express.Router();

// Internal Modules
import authController from "../controller/authController";

// [ info at ../controllers/authController ]
router.post("/", authController.handleLogin);

export default router;
