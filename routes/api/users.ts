// Third-Party Modules
import express from "express";
const router = express.Router();

// Internal Modules
import verifyJWT from "../../middleware/verifyJWT";
import {
    createUser,
    readUser,
    readAllUsers,
    updateUser,
    deleteUser,
} from "../../controller/usersController";

router
    .route("/")
    .post(createUser)
    .get(readAllUsers)
    .put(verifyJWT, updateUser)
    .delete(verifyJWT, deleteUser);
router.route("/:id").get(readUser);

export default router;
