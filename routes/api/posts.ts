// Third-Party Modules
import express from "express";
const router = express.Router();

// Internal Modules
import verifyJWT from "../../middleware/verifyJWT";
import {
    createPost,
    readPost,
    readAllPosts,
    updatePost,
    deletePost,
} from "../../controller/postsController";

router
    .route("/")
    .post(verifyJWT, createPost)
    .get(readAllPosts)
    .put(verifyJWT, updatePost)
    .delete(verifyJWT, deletePost);
router.route("/:id").get(readPost);

export default router;
