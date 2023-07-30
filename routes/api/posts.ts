// Third-Party Modules
import express from "express";
const router = express.Router();

// Internal Modules
import verifyJWT from "../../middleware/verifyJWT";
import {
    createPost,
    readPostById,
    readAllPosts,
    readAllPostsByUser,
    updatePostById,
    likePostById,
    deletePostById,
} from "../../controllers/posts";

router.route("/").post(verifyJWT, createPost).get(readAllPosts);
router
    .route("/:id")
    .get(readPostById)
    .put(verifyJWT, updatePostById)
    .delete(verifyJWT, deletePostById);
router.route("/like/:id").put(verifyJWT, likePostById);
router.route("/user/:id").get(readAllPostsByUser);

export default router;
