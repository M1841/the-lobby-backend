// Third-Party Modules
import express from "express";
const router = express.Router();

// Internal Modules
import logoutController from "../controller/logoutController";

// [ more info in ../controllers/logoutController ]
router.get("/", logoutController.handleLogout);

export default router;
