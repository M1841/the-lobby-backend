// Third-Party Modules
import { Request, Response } from "express";
import mongoose from "mongoose";
import fileUpload from "express-fileupload";

// Internal Modules
import Post from "../models/Post";
import File from "../models/File";
import { uploadFiles } from "./fileUpload";

const isValidID = mongoose.Types.ObjectId.isValid;

// ------------------------ CREATE ------------------------ //
const createPost = async (req: Request, res: Response) => {
    // check for required attributes
    if (!req?.body?.content) {
        // 400 Bad Request
        return res.status(400).send("Missing post content");
    }

    try {
        let mediaIDs: mongoose.Types.ObjectId[] = [];
        if (req.files) {
            const reqFiles = req.files as fileUpload.FileArray;
            let fileCount = 0;
            Object.keys(reqFiles).forEach((key) => {
                fileCount++;
                if (fileCount > 10) {
                    // 413 Payload Too Large
                    return res
                        .status(413)
                        .send("Too many files. Maximum is 10");
                }
                const file = reqFiles[key] as fileUpload.UploadedFile;
                reqFiles[key] = file;
            });
            req.files = reqFiles;
            req.body.image = req.body.video = req.body.audio = true;
            mediaIDs = (await uploadFiles(
                req,
                res
            )) as unknown as mongoose.Types.ObjectId[];
        }

        // create and store the new post
        await Post.create({
            content: req.body.content,
            userID: req.body.currentUserID,
            date: new Date(),
            mediaIDs,
        });

        // 201 Created
        return res.sendStatus(201);
    } catch (err: unknown) {
        // 500 Internal Server Error
        return res.status(500).json(err);
    }
};

// ------------------------- READ ------------------------- //
const readAllPosts = async (req: Request, res: Response) => {
    try {
        const posts = await Post.find();
        // check if no posts were found
        if (!posts || posts.length < 1) {
            // 204 No Content
            return res.sendStatus(204);
        }

        return res.json(posts);
    } catch (err: unknown) {
        // 500 Internal Server Error
        return res.status(500).json(err);
    }
};

const readPostById = async (req: Request, res: Response) => {
    // check if the ID is missing or incorrectly formatted
    if (!req?.params?.id || !isValidID(req?.params?.id)) {
        // 400 Bad Request
        return res.status(400).send("Invalid post ID");
    }
    try {
        const post = await Post.findById(req.params.id).exec();

        // check if no post was found
        if (!post) {
            // 404 Not Found
            return res.status(404).send("Post does not exist");
        }

        return res.json(post);
    } catch (err: unknown) {
        // 500 Internal Server Error
        return res.status(500).json(err);
    }
};

const readAllPostsByUser = async (req: Request, res: Response) => {
    // check if the ID is missing or incorrectly formatted
    if (!req?.params?.id || !isValidID(req?.params?.id)) {
        // 400 Bad Request
        return res.status(400).send("Invalid user ID");
    }
    try {
        const posts = await Post.find({ userID: req.params.id });

        // check if no posts were found
        if (!posts) {
            // 204 No Content
            return res.sendStatus(204);
        }
        return res.json(posts);
    } catch (err: unknown) {
        // 500 Internal Server Error
        return res.status(500).json(err);
    }
};

// ------------------------ UPDATE ------------------------ //
const updatePostById = async (req: Request, res: Response) => {
    // check if the ID is missing or incorrectly formatted
    if (!req?.params?.id || !isValidID(req?.params?.id)) {
        // 400 Bad Request
        return res.status(400).send("Invalid post ID");
    }

    try {
        const post = await Post.findById(req.params.id).exec();

        // check if no post was found
        if (!post) {
            // 404 Not Found
            return res.status(404).send("Post does not exist");
        }

        // check if the post belongs to the user
        if (post.userID.toString() !== req.body.currentUserID) {
            // 403 Forbidden
            return res
                .status(403)
                .send("Attempted editing another user's post");
        }

        // update the post based on the provided data
        if (req.body?.content) post.content = req.body.content;

        if (req.files) {
            const reqFiles = req.files as fileUpload.FileArray;
            let fileCount = 0;
            Object.keys(reqFiles).forEach((key) => {
                fileCount++;
                if (fileCount > 10) {
                    // 413 Payload Too Large
                    return res
                        .status(413)
                        .send("Too many files. Maximum is 10");
                }
                const file = reqFiles[key] as fileUpload.UploadedFile;
                reqFiles[key] = file;
            });
            req.files = reqFiles;
            req.body.image = req.body.video = req.body.audio = true;
            const mediaIDs = (await uploadFiles(
                req,
                res
            )) as unknown as mongoose.Types.ObjectId[];
            const oldMedia = await File.find({
                _id: { $in: [...post.mediaIDs] },
            });
            if (oldMedia)
                await File.deleteMany({ _id: { $in: [...post.mediaIDs] } });
            post.mediaIDs = mediaIDs;
        }

        await post.save();

        // 200 OK
        return res.sendStatus(200);
    } catch (err: unknown) {
        // 500 Internal Server Error
        return res.status(500).json(err);
    }
};

const likePostById = async (req: Request, res: Response) => {
    // check if the ID is missing or incorrectly formatted
    if (!req?.params?.id || !isValidID(req?.params?.id)) {
        // 400 Bad Request
        return res.status(400).send("Invalid post ID");
    }

    try {
        const post = await Post.findById(req.params.id).exec();

        // check if no post was found
        if (!post) {
            // 404 Not Found
            return res.status(404).send("Post does not exist");
        }

        if (post.likeIDs.indexOf(req.body.currentUserID) === -1) {
            // add the user ID to the like IDs array if it's not already there
            post.likeIDs.push(req.body.currentUserID);
        } else {
            // remove the user ID from the like IDs array if it's already there
            post.likeIDs = post.likeIDs.filter(
                (userID) => userID.toString() !== req.body.currentUserID
            );
        }

        await post.save();

        // 200 OK
        return res.sendStatus(200);
    } catch (err: unknown) {
        // 500 Internal Server Error
        return res.status(500).json(err);
    }
};

// ------------------------ DELETE ------------------------ //
const deletePostById = async (req: Request, res: Response) => {
    // check if the ID is missing or incorrectly formatted
    if (!req?.params?.id || !isValidID(req?.params?.id)) {
        // 400 Bad Request
        return res.status(400).send("Invalid post ID");
    }

    try {
        const post = await Post.findById(req.params.id).exec();

        // only delete the post if it exists
        if (post) {
            // check if the post belongs to the user
            if (post.userID.toString() !== req.body.currentUserID) {
                // 403 Forbidden
                return res
                    .status(403)
                    .send("Attempted deleting another user's post");
            }

            // delete the attached media
            const media = await File.find({
                _id: { $in: [...post.mediaIDs] },
            });
            if (media)
                await File.deleteMany({ _id: { $in: [...post.mediaIDs] } });

            // delete fields from the post but keep it in the database
            post.content = "[deleted]";
            post.userID = null;
            post.mediaIDs = [];

            await post.save();
        }

        // 204 No Content
        return res.sendStatus(204);
    } catch (err: unknown) {
        // 500 Internal Server Error
        return res.status(500).json(err);
    }
};

export {
    createPost,
    readPostById,
    readAllPosts,
    readAllPostsByUser,
    updatePostById,
    likePostById,
    deletePostById,
};
