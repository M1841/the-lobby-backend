// Third-Party Modules
import { Request, Response } from "express";
import { format } from "date-fns";

// Internal Modules
import Post from "../model/Post";

// ------------------------ CREATE ------------------------ //
const createPost = async (req: Request, res: Response) => {
    // check for required attributes
    if (!req?.body?.title || !req?.body?.content || !req?.body?.userID) {
        // send a "Bad Request" status and a descriptive message
        return res.status(400).json({
            message: "Missing required title, content or user ID attributes",
        });
    }

    try {
        const result = await Post.create({
            title: req.body.title,
            content: req.body.content,
            userID: req.body.userID,
            date: new Date(),
            likeIDs: [] as string[],
            commentIDs: [] as string[],
        });

        res.status(201).json(result);
    } catch (err: unknown) {
        console.error(err);
    }
};

// ------------------------- READ ------------------------- //
const readPost = async (req: Request, res: Response) => {
    // check if the ID is missing
    if (!req?.params?.id) {
        // send a "Bad Request" status and a descriptive message
        return res
            .status(400)
            .json({ message: "Missing required ID parameter" });
    }

    const post = await Post.findById(req.params.id).exec();

    // check if no post was found
    if (!post) {
        return res
            .status(204)
            .json({ message: `No post matches ID = ${req.params.id}` });
    }

    res.json(post);
};

const readAllPosts = async (req: Request, res: Response) => {
    const posts = await Post.find();
    if (!posts || posts.length < 1) {
        return res.status(204).json({ message: "No posts were found" });
    }

    res.json(posts);
};

// ------------------------ UPDATE ------------------------ //
const updatePost = async (req: Request, res: Response) => {
    // check if the ID is missing
    if (!req?.body?.id) {
        // send a "Bad Request" status and a descriptive message
        return res
            .status(400)
            .json({ message: "Missing required ID parameter" });
    }

    const post = await Post.findById(req.body.id).exec();

    // check if no post was found
    if (!post) {
        return res
            .status(204)
            .json({ message: `No post matches ID = ${req.body.id}` });
    }

    // check if the post belongs to the user
    if (post.userID !== req.body.userID) {
        // send a "Forbidden" status
        return res.sendStatus(403);
    }

    // update the post based on the provided data
    if (req.body?.title) post.title = req.body.title;
    if (req.body?.content) post.content = req.body.content;

    const result = await post.save();

    res.json(result);
};

// ------------------------ DELETE ------------------------ //
const deletePost = async (req: Request, res: Response) => {
    // check if the ID is missing
    if (!req?.body?.id) {
        // send a "Bad Request" status and a descriptive message
        return res
            .status(400)
            .json({ message: "Missing required ID parameter" });
    }

    const post = await Post.findById(req.body.id).exec();

    // check if no post was found
    if (!post) {
        return res
            .status(204)
            .json({ message: `No post matches ID = ${req.body.id}` });
    }

    // check if the post belongs to the user
    if (post.userID !== req.body.userID) {
        // send a "Forbidden" status
        return res.sendStatus(403);
    }

    const result = await Post.deleteOne({ _id: req.body.id });

    res.json(result);
};

export { createPost, readPost, readAllPosts, updatePost, deletePost };
