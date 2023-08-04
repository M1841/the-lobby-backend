// Third-Party Modules
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import fileUpload from "express-fileupload";

// Internal Modules
import User from "../models/User";
import Post from "../models/Post";
import Comment from "../models/Comment";
import File from "../models/File";
import { uploadFiles } from "./fileUpload";

const isValidID = mongoose.Types.ObjectId.isValid;

// ------------------------ CREATE ------------------------ //
const createNewUser = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    // check for the required attributes
    if (!username || !email || !password) {
        let missingFields: {
            username?: "missing";
            email?: "missing";
            password?: "missing";
        } = {};
        if (!username) missingFields.username = "missing";
        if (!email) missingFields.email = "missing";
        if (!password) missingFields.password = "missing";
        // 400 Bad Request
        return res.status(400).json(missingFields);
    }

    try {
        // check for duplicate usernames or emails
        const isUsernameTaken = await User.findOne({ username }).exec();
        const isEmailTaken = await User.findOne({ email }).exec();
        if (isUsernameTaken || isEmailTaken) {
            let takenFields: {
                username?: "taken";
                email?: "taken";
            } = {};
            if (isUsernameTaken) takenFields.username = "taken";
            if (isEmailTaken) takenFields.email = "taken";
            // 409 Conflict
            return res.status(409).send(takenFields);
        }
        // encrypt the password
        const encryptedPassword = await bcrypt.hash(password, 10);

        // create and store the new user
        await User.create({
            username: username,
            email: email,
            password: encryptedPassword,
        });

        // 201 Created
        return res.sendStatus(201);
    } catch (err: unknown) {
        // 500 Internal Server Errror
        return res.status(500).json(err);
    }
};

// ------------------------- READ ------------------------- //
const readAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find();
        // check if no users were found
        if (!users || users.length < 1) {
            // 204 No Content
            return res.sendStatus(204);
        }

        // send back public user information
        const publicUsers: IPublicUser[] = users.map((user) => {
            return {
                _id: user._id,
                username: user.username,
                displayName: user.displayName,
                bio: user.bio,
                location: user.location,
                pictureID: user.pictureID,
                followerIDs: user.followerIDs,
                followingIDs: user.followingIDs,
            };
        });

        // 200 OK
        return res.json(publicUsers);
    } catch (err: unknown) {
        // 500 Internal Server Error
        return res.status(500).json(err);
    }
};

const readUserById = async (req: Request, res: Response) => {
    // check if the ID is missing or incorrectly formatted
    if (!req?.params?.id || !isValidID(req?.params?.id)) {
        // 400 Bad Request
        return res.status(400).send("Invalid user ID");
    }

    try {
        const user = await User.findById(req.params.id).exec();

        // check if no user was found
        if (!user) {
            // 404 Not Found
            return res.status(404).send("User does not exist");
        }

        return res.json({
            _id: user._id,
            username: user.username,
            displayName: user.displayName,
            bio: user.bio,
            location: user.location,
            pictureID: user.pictureID,
            followerIDs: user.followerIDs,
            followingIDs: user.followingIDs,
        });
    } catch (err: unknown) {
        // 500 Internal Server Error
        return res.status(500).json(err);
    }
};

// ------------------------ UPDATE ------------------------ //
const updateUserById = async (req: Request, res: Response) => {
    // check if the ID is missing or incorrectly formatted
    if (!req?.params?.id || !isValidID(req?.params?.id)) {
        // 400 Bad Request
        return res.status(400).send("Invalid user ID");
    }

    // check if the user is trying to edit someone else's profile
    if (req.params.id !== req.body.currentUserID) {
        // 403 Forbidden
        return res.status(403).send("Attempted editing another user's profile");
    }
    try {
        const user = await User.findById(req.params.id).exec();

        // check if no user was found
        if (!user) {
            // 404 Not Found
            return res.status(404).send("User does not exist");
        }

        let takenFields: {
            username?: "taken";
            email?: "taken";
        } = {};
        // update the user based on the provided data
        if (req.body?.username) {
            // check for duplicate usernames
            const isUsernameTaken = await User.findOne({
                username: req.body.username,
            }).exec();
            if (isUsernameTaken) takenFields.username = "taken";
            else user.username = req.body.username;
        }

        if (req.body?.email) {
            // check for duplicate emails
            const isEmailTaken = await User.findOne({
                email: req.body.email,
            }).exec();
            if (isEmailTaken) takenFields.email = "taken";
            else user.email = req.body.email;
        }

        if (takenFields.username || takenFields.email) {
            // 409 Conflict
            return res.status(409).send(takenFields);
        }

        if (req.body?.displayName) user.username = req.body.displayName;
        if (req.body?.bio) user.username = req.body.bio;
        if (req.body?.location) user.username = req.body.location;
        if (req.body?.password)
            user.password = await bcrypt.hash(req.body.password, 10);

        if (req.files) {
            const reqFiles = req.files as fileUpload.FileArray;
            let fileCount = 0;
            Object.keys(reqFiles).forEach((key) => {
                fileCount++;
                if (fileCount > 1) {
                    // 413 Payload Too Large
                    return res.status(413).send("Too many files. Maximum is 1");
                }
                const file = reqFiles[key] as fileUpload.UploadedFile;
                reqFiles[key] = file;
            });
            req.files = reqFiles;
            req.body.image = true;
            const fileIDs = (await uploadFiles(
                req,
                res
            )) as unknown as mongoose.Types.ObjectId[];
            const oldPicture = await File.findById(user.pictureID);
            if (oldPicture) await File.deleteOne({ _id: user.pictureID });
            user.pictureID = fileIDs[0];
        }

        await user.save();

        // 200 OK
        return res.sendStatus(200);
    } catch (err: unknown) {
        // 500 Internal Server Error
        return res.status(500).json(err);
    }
};

const followUserById = async (req: Request, res: Response) => {
    // check if the ID is missing or incorrectly formatted
    if (!req?.params?.id || !isValidID(req?.params?.id)) {
        // 400 Bad Request
        return res.status(400).send("Invalid user ID");
    }
    if (req.params.id === req.body.currentUserID) {
        // 409 Conflict
        return res.status(409).send("Attempted following self");
    }
    try {
        const currentUser = await User.findById(req.body.currentUserID).exec();
        const targetUser = await User.findById(req.params.id).exec();

        // check if no user was found
        if (!targetUser || !currentUser) {
            // 404 Not Found
            return res.status(404).send("User does not exist");
        }

        if (
            targetUser.followerIDs.indexOf(currentUser._id) === -1 &&
            currentUser.followingIDs.indexOf(targetUser._id) === -1
        ) {
            // add the current user's ID to the target user's follower IDs array if it's not already there
            targetUser.followerIDs.push(currentUser._id);

            // add the target user's ID to the current user's following IDs array if it's not already there
            currentUser.followingIDs.push(targetUser._id);
        } else {
            // remove the current user's ID from the target user's follower IDs array if it's already there
            const newFollowerIDs = targetUser.followerIDs.filter(
                (userID) => userID.toString() !== currentUser._id.toString()
            );
            targetUser.followerIDs = newFollowerIDs;
            // remove the target user's ID from the current user's following IDs array if it's already there
            const newFollowingIDs = currentUser.followingIDs.filter(
                (userID) => userID.toString() !== targetUser._id.toString()
            );
            currentUser.followingIDs = newFollowingIDs;
        }
        await targetUser.save();
        await currentUser.save();

        // 200 OK
        return res.sendStatus(200);
    } catch (err: unknown) {
        // 500 Internal Server Error
        return res.status(500).json(err);
    }
};

// ------------------------ DELETE ------------------------ //
const deleteUserById = async (req: Request, res: Response) => {
    // check if the ID is missing or incorrectly formatted
    if (!req?.params?.id || !isValidID(req?.params?.id)) {
        // 400 Bad Request
        return res.status(400).send("Invalid user ID");
    }

    // check if the user is trying to delete someone else's account
    if (req.params.id !== req.body.currentUserID) {
        // 403 Forbidden
        return res
            .status(403)
            .send("Attempted deleting another user's account");
    }
    try {
        const user = await User.findById(req.params.id).exec();

        // only delete the account if it exists
        if (user) {
            // delete the profile picture
            const picture = await File.findById(user.pictureID);
            if (picture) await File.deleteOne({ _id: user.pictureID });

            // disown posts
            const posts = await Post.find({ userID: user._id });
            if (posts) {
                posts.map(async (post) => {
                    post.userID = null;
                    await post.save();
                });
            }
            // disown comments
            const comments = await Comment.find({ userID: user._id });
            if (comments) {
                comments.map(async (comment) => {
                    comment.userID = null;
                    await comment.save();
                });
            }

            // unlike posts
            const likedPosts = await Post.find({ likeIDs: user._id });
            if (likedPosts) {
                likedPosts.map(async (likedPost) => {
                    likedPost.likeIDs = likedPost.likeIDs.filter(
                        (userID) => userID.toString() !== user._id
                    );
                    await likedPost.save();
                });
            }
            // unlike comments
            const likedComments = await Comment.find({ likeIDs: user._id });
            if (likedComments) {
                likedComments.map(async (likedComment) => {
                    likedComment.likeIDs = likedComment.likeIDs.filter(
                        (userID) => userID.toString() !== user._id
                    );
                    await likedComment.save();
                });
            }

            // unfollow users
            const following = await User.find({ followerIDs: user._id });
            if (following) {
                following.map(async (followedUser) => {
                    followedUser.followerIDs = followedUser.followerIDs.filter(
                        (userID) => userID.toString() !== user._id
                    );
                    await followedUser.save();
                });
            }
            // remove followers
            const followers = await User.find({ followingIDs: user._id });
            if (followers) {
                followers.map(async (follower) => {
                    follower.followingIDs = follower.followingIDs.filter(
                        (userID) => userID.toString() !== user._id
                    );
                    await follower.save();
                });
            }
            await User.deleteOne({ _id: req.params.id });
        }

        // 204 No Content
        return res.sendStatus(204);
    } catch (err: unknown) {
        // 500 Internal Server Error
        return res.status(500).json(err);
    }
};

export {
    createNewUser,
    readUserById,
    readAllUsers,
    updateUserById,
    followUserById,
    deleteUserById,
};
