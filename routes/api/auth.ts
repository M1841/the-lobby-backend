// Third-Party Modules
import express from "express";
const router = express.Router();

// Internal Modules
import {
    handleLogin,
    handleLogout,
    handleRefresh,
} from "../../controller/authController";

// [ info at ../controllers/authController ]
router
    .post("/login", handleLogin)
    .get("/logout", handleLogout)
    .get("/refresh", handleRefresh);

export default router;
