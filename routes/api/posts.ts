// Third-Party Modules
import express from "express";
const router = express.Router();

// Internal Modules
import verifyJWT from "../../middleware/verifyJWT";
import {
    createPost,
    readPost,
    readAllPosts,
    readAllPostsByUser,
    updatePost,
    deletePost,
} from "../../controller/postsController";

router
    .route("/")
    .post(verifyJWT, createPost)
    .get(readAllPosts)
    .put(verifyJWT, updatePost)
    .delete(verifyJWT, deletePost);
router.get("/:id", readPost);
router.get("/user/:id", readAllPostsByUser);

export default router;
