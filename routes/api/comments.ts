// Third-Party Modules
import express from "express";
const router = express.Router();

// Internal Modules
import verifyJWT from "../../middleware/verifyJWT";
import {
    createNewComment,
    readCommentById,
    readAllComments,
    readAllCommentsByUser,
    readAllCommentsByParent,
    updateCommentById,
    likeCommentById,
    deleteCommentById,
} from "../../controllers/comments";

router.route("/").post(verifyJWT, createNewComment).get(readAllComments);
router
    .route("/:id")
    .get(readCommentById)
    .put(verifyJWT, updateCommentById)
    .delete(verifyJWT, deleteCommentById);
router.route("/like/:id").put(verifyJWT, likeCommentById);
router.route("/user/:id").get(readAllCommentsByUser);
router.route("/parent/:id").get(readAllCommentsByParent);

export default router;
