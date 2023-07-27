// Third-Party Modules
import express from "express";
const router = express.Router();

// Internal Modules
import verifyJWT from "../../middleware/verifyJWT";
import {
    createNewUser,
    readUserById,
    readAllUsers,
    updateUserById,
    followUserById,
    deleteUserById,
} from "../../controller/usersController";

router.route("/").post(createNewUser).get(readAllUsers);
router
    .route("/:id")
    .get(readUserById)
    .put(verifyJWT, updateUserById)
    .delete(verifyJWT, deleteUserById);

router.route("/follow/:id").put(verifyJWT, followUserById);

export default router;
