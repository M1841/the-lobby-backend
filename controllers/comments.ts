// Third-Party Modules
import { Request, Response } from "express";
import mongoose from "mongoose";

// Internal Modules
import Comment from "../models/Comment";
import Post from "../models/Post";

const isValidID = mongoose.Types.ObjectId.isValid;

// ------------------------ CREATE ------------------------ //
const createNewComment = async (req: Request, res: Response) => {
    // check for required attributes
    if (!req?.body?.content || !req?.body?.postID) {
        // 400 Bad Request
        return res.status(400).send("Missing comment content or post ID");
    }

    try {
        const post = await Post.findById(req.body.postID).exec();

        // check if no post was found
        if (!post) {
            // 404 Not Found
            return res.status(404).send("Post does not exist");
        }

        // create and store the new comment
        const comment = await Comment.create({
            content: req.body.content,
            userID: req.body.currentUserID,
            postID: req.body.postID,
            date: new Date(),
            likeIDs: [] as string[],
            commentIDs: [] as string[],
        });

        // add the ID of new comment to the corresponding post
        post.commentIDs.push(comment._id);
        await post.save();

        // 201 Created
        return res.sendStatus(201);
    } catch (err: unknown) {
        // 500 Internal Server Error
        return res.status(500).json(err);
    }
};

// ------------------------- READ ------------------------- //
const readAllComments = async (req: Request, res: Response) => {
    try {
        const comments = await Comment.find();
        // check if no comments were found
        if (!comments || comments.length < 1) {
            // 204 No Content
            return res.sendStatus(204);
        }

        return res.json(comments);
    } catch (err: unknown) {
        // 500 Internal Server Error
        return res.status(500).json(err);
    }
};

const readCommentById = async (req: Request, res: Response) => {
    // check if the ID is missing or incorrectly formatted
    if (!req?.params?.id || !isValidID(req?.params?.id)) {
        // 400 Bad Request
        return res.status(400).send("Invalid comment ID");
    }
    try {
        const comment = await Comment.findById(req.params.id).exec();

        // check if no comment was found
        if (!comment) {
            // 404 Not Found
            return res.status(404).send("Comment does not exist");
        }

        return res.json(comment);
    } catch (err: unknown) {
        // 500 Internal Server Error
        return res.status(500).json(err);
    }
};

const readAllCommentsByUser = async (req: Request, res: Response) => {
    // check if the ID is missing or incorrectly formatted
    if (!req?.params?.id || !isValidID(req?.params?.id)) {
        // 400 Bad Request
        return res.status(400).send("Invalid user ID");
    }
    try {
        const comment = await Comment.find({ userID: req.params.id });

        // check if no comment was found
        if (!comment) {
            // 204 No Content
            return res.sendStatus(204);
        }

        return res.json(comment);
    } catch (err: unknown) {
        // 500 Internal Server Error
        return res.status(500).json(err);
    }
};

const readAllCommentsByPost = async (req: Request, res: Response) => {
    // check if the ID is missing or incorrectly formatted
    if (!req?.params?.id || !isValidID(req?.params?.id)) {
        // 400 Bad Request
        return res.status(400).send("Invalid post ID");
    }
    try {
        const comment = await Comment.find({ postID: req.params.id });

        // check if no comment was found
        if (!comment) {
            // 204 No Content
            return res.sendStatus(204).send("Comment does not exist");
        }

        return res.json(comment);
    } catch (err: unknown) {
        // 500 Internal Server Error
        return res.status(500).json(err);
    }
};

// ------------------------ UPDATE ------------------------ //
const updateCommentById = async (req: Request, res: Response) => {
    // check if the ID is missing or incorrectly formatted
    if (!req?.params?.id || !isValidID(req?.params?.id)) {
        // 400 Bad Request
        return res.status(400).send("Invalid comment ID");
    }

    try {
        const comment = await Comment.findById(req.params.id).exec();

        // check if no comment was found
        if (!comment) {
            // 404 Not Found
            return res.status(404).send("Comment does not exist");
        }

        // check if the comment belongs to the user
        if (comment.userID !== req.body.currentUserID) {
            // 403 Forbidden
            return res
                .status(403)
                .send("Attempted editing another user's comment");
        }

        // update the comment based on the provided data
        if (req.body?.content) comment.content = req.body.content;

        await comment.save();

        // 200 OK
        return res.sendStatus(200);
    } catch (err: unknown) {
        // 500 Internal Server Error
        res.sendStatus(500).json(err);
    }
};

const likeCommentById = async (req: Request, res: Response) => {
    // check if the ID is missing or incorrectly formatted
    if (!req?.params?.id || !isValidID(req?.params?.id)) {
        // 400 Bad Request
        return res.status(400).send("Invalid comment ID");
    }

    try {
        const comment = await Comment.findById(req.params.id).exec();

        // check if no comment was found
        if (!comment) {
            // 404 Not Found
            return res.status(404).send("Comment does not exist");
        }

        if (comment.likeIDs.indexOf(req.body.currentUserID) === -1) {
            // add the user ID to the like IDs array if it's not already there
            comment.likeIDs.push(req.body.currentUserID);
        } else {
            // remove the user ID from the like IDs array if it's already there
            const newLikeIDs = comment.likeIDs.filter(
                (userID) => userID.toString() !== req.body.currentUserID
            );
            comment.likeIDs = newLikeIDs;
        }

        await comment.save();

        // 200 OK
        return res.sendStatus(200);
    } catch (err: unknown) {
        // 500 Internal Server Error
        res.sendStatus(500).json(err);
    }
};

// ------------------------ DELETE ------------------------ //
const deleteCommentById = async (req: Request, res: Response) => {
    // check if the ID is missing or incorrectly formatted
    if (!req?.params?.id || !isValidID(req?.params?.id)) {
        // 400 Bad Request
        return res.status(400).send("Invalid comment ID");
    }

    try {
        const comment = await Comment.findById(req.params.id).exec();

        // only delete the post if it exists
        if (comment) {
            const post = await Post.findById(req.body.postID).exec();

            // check if no post was found
            if (!post) {
                // 204 No Content
                return res
                    .status(204)
                    .send(`No post matches ID = ${req.body.postID}`);
            }
            // check if the post belongs to the user
            if (comment.userID !== req.body.currentUserID) {
                // 403 Forbidden
                return res
                    .status(403)
                    .send("Attempted deleting another user's comment");
            }

            await Comment.deleteOne({ _id: req.params.id });

            // remove the ID of new comment to the corresponding post
            post.commentIDs.filter((commentID) => commentID !== req.params.id);
            await post.save();
        }

        // 204 No Content
        return res.sendStatus(204);
    } catch (err: unknown) {
        // 500 Internal Server Error
        res.sendStatus(500).json(err);
    }
};

export {
    createNewComment,
    readAllComments,
    readCommentById,
    readAllCommentsByUser,
    readAllCommentsByPost,
    updateCommentById,
    likeCommentById,
    deleteCommentById,
};
