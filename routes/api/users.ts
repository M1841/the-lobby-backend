// Third-Party Modules
import express from "express";
const router = express.Router();
import fileUpload from "express-fileupload";

// Internal Modules
import verifyJWT from "../../middleware/verifyJWT";
import {
    createNewUser,
    readUserById,
    readAllUsers,
    updateUserById,
    followUserById,
    deleteUserById,
} from "../../controllers/users";

router.route("/").post(createNewUser).get(readAllUsers);
router
    .route("/:id")
    .get(readUserById)
    .put(verifyJWT, fileUpload({ createParentPath: true }), updateUserById)
    .delete(verifyJWT, deleteUserById);

router.route("/follow/:id").put(verifyJWT, followUserById);

export default router;
