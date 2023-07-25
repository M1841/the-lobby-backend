// Third-Party Modules
import { Request, Response } from "express";
import mongoose from "mongoose";

// Internal Modules
import Post from "../model/Post";

// ------------------------ CREATE ------------------------ //
const createPost = async (req: Request, res: Response) => {
    // check for required attributes
    if (!req?.body?.content || !req?.body?.currentUserID) {
        // send a "Bad Request" status and a descriptive message
        return res.status(400).json({
            message: "Missing required title, content or user ID attributes",
        });
    }

    try {
        const post = await Post.create({
            content: req.body.content,
            userID: req.body.currentUserID,
            date: new Date(),
            likeIDs: [] as string[],
            commentIDs: [] as string[],
        });

        res.status(201).json(post);
    } catch (err: unknown) {
        res.sendStatus(500).json(err);
    }
};

// ------------------------- READ ------------------------- //
const readPost = async (req: Request, res: Response) => {
    // check if the ID is missing or incorrectly formatted
    if (!req?.body?.id || !mongoose.Types.ObjectId.isValid(req?.body?.id)) {
        // send a "Bad Request" status and a descriptive message
        return res.status(400).json({
            message: "ID parameter is missing or incorrectly formatted",
        });
    }
    try {
        const post = await Post.findById(req.params.id).exec();

        // check if no post was found
        if (!post) {
            // send a "No Content" status and a descriptive message
            return res
                .status(204)
                .json({ message: `No post matches ID = ${req.params.id}` });
        }

        res.json(post);
    } catch (err: unknown) {
        res.sendStatus(500).json(err);
    }
};

const readAllPosts = async (req: Request, res: Response) => {
    try {
        const posts = await Post.find();
        // check if no posts were found
        if (!posts || posts.length < 1) {
            // send a "No Content" status and a descriptive message
            return res.status(204).json({ message: "No posts were found" });
        }

        res.json(posts);
    } catch (err: unknown) {
        res.sendStatus(500).json(err);
    }
};

const readAllPostsByUser = async (req: Request, res: Response) => {
    // check if the ID is missing or incorrectly formatted
    if (!req?.body?.id || !mongoose.Types.ObjectId.isValid(req?.body?.id)) {
        // send a "Bad Request" status and a descriptive message
        return res.status(400).json({
            message: "ID parameter is missing or incorrectly formatted",
        });
    }
    try {
        const posts = await Post.find({ userID: req.params.id });

        // check if no posts were found
        if (!posts) {
            // send a "No Content" status and a descriptive message
            return res
                .status(204)
                .json({ message: `No posts match userID = ${req.params.id}` });
        }
        res.json(posts);
    } catch (err: unknown) {
        res.sendStatus(500).json(err);
    }
};

// ------------------------ UPDATE ------------------------ //
const updatePost = async (req: Request, res: Response) => {
    // check if the ID is missing or incorrectly formatted
    if (!req?.body?.id || !mongoose.Types.ObjectId.isValid(req?.body?.id)) {
        // send a "Bad Request" status and a descriptive message
        return res.status(400).json({
            message: "ID parameter is missing or incorrectly formatted",
        });
    }

    const post = await Post.findById(req.body.id).exec();

    // check if no post was found
    if (!post) {
        return res
            .status(204)
            .json({ message: `No post matches ID = ${req.body.id}` });
    }

    // check if the post belongs to the user
    if (post.userID !== req.body.currentUserID) {
        // send a "Forbidden" status
        return res.sendStatus(403);
    }

    // update the post based on the provided data
    if (req.body?.content) post.content = req.body.content;

    const result = await post.save();

    res.json(result);
};

// ------------------------ DELETE ------------------------ //
const deletePost = async (req: Request, res: Response) => {
    // check if the ID is missing or incorrectly formatted
    if (!req?.body?.id || !mongoose.Types.ObjectId.isValid(req?.body?.id)) {
        // send a "Bad Request" status and a descriptive message
        return res.status(400).json({
            message: "ID parameter is missing or incorrectly formatted",
        });
    }

    const post = await Post.findById(req.body.id).exec();

    // check if no post was found
    if (!post) {
        return res
            .status(204)
            .json({ message: `No post matches ID = ${req.body.id}` });
    }

    // check if the post belongs to the user
    if (post.userID !== req.body.currentUserID) {
        // send a "Forbidden" status
        return res.sendStatus(403);
    }

    await Post.deleteOne({ _id: req.body.id });

    res.json({ message: `Successfully deleted post ${req.body.id}` });
};

export {
    createPost,
    readPost,
    readAllPosts,
    readAllPostsByUser,
    updatePost,
    deletePost,
};
