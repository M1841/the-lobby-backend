// Third-Party Modules
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

// Internal Modules
import User from "../model/User";

// ------------------------ CREATE ------------------------ //
const createUser = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    // check for the required attributes
    if (!username || !email || !password) {
        // send a "Bad Request" status and a descriptive message
        res.status(400).json({
            message: "Missing required attributes",
        });
    }

    try {
        // check for duplicate usernames or emails
        const isDuplicateUsername = await User.findOne({ username }).exec();
        const isDuplicateEmail = await User.findOne({ email }).exec();
        if (isDuplicateUsername || isDuplicateEmail) {
            // send a "Conflict" status
            return res.sendStatus(409);
        }
        // encrypt the password
        const encryptedPassword = await bcrypt.hash(password, 10);

        // create and store the new user
        await User.create({
            username: username,
            email: email,
            password: encryptedPassword,
        });

        // send a "Created" status and a descriptive message
        res.status(201).json({
            message: `New user ${username} was registered`,
        });
    } catch (err: unknown) {
        // send an "Internal Server Error" status and the error message
        res.status(500).json(err);
    }
};

// ------------------------- READ ------------------------- //
const readUser = async (req: Request, res: Response) => {
    // check if the ID is missing or incorrectly formatted
    if (!req?.params?.id || !mongoose.Types.ObjectId.isValid(req?.params?.id)) {
        // send a "Bad Request" status and a descriptive message
        return res.status(400).json({
            message: "ID parameter is missing or incorrectly formatted",
        });
    }

    try {
        const user = await User.findById(req.params.id).exec();

        // check if no user was found
        if (!user) {
            // send a "No Content" status and a descriptive message
            return res
                .status(204)
                .json({ message: `No user matches ID = ${req.params.id}` });
        }

        res.json({ id: user._id, username: user.username });
    } catch (err: unknown) {
        // send an "Internal Server Error" status and the error message
        res.status(500).json(err);
    }
};

const readAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find();
        // check if no users were found
        if (!users || users.length < 1) {
            // send a "No Content" status and a descriptive message
            return res.status(204).json({ message: "No users were found" });
        }

        // only send back the public data
        const publicUsers: IPublicUser[] = users.map((user) => {
            const { _id, username } = user;
            return { id: _id.toString(), username };
        });
        res.json(publicUsers);
    } catch (err: unknown) {
        // send an "Internal Server Error" status and the error message
        res.status(500).json(err);
    }
};

// ------------------------ UPDATE ------------------------ //
const updateUser = async (req: Request, res: Response) => {
    // check if the ID is missing or incorrectly formatted
    if (!req?.body?.id || !mongoose.Types.ObjectId.isValid(req?.body?.id)) {
        // send a "Bad Request" status and a descriptive message
        return res.status(400).json({
            message: "ID parameter is missing or incorrectly formatted",
        });
    }

    // check if the user is trying to edit someone else's profile
    if (req.body.id !== req.body.currentUserID) {
        // send a "Forbidden" status
        return res.sendStatus(403);
    }
    try {
        const user = await User.findById(req.body.id).exec();

        // check if no user was found
        if (!user) {
            // send a "No Content" status and a descriptive message
            return res
                .status(204)
                .json({ message: `No user matches ID = ${req.params.id}` });
        }

        const oldUsername = user.username;
        // update the user based on the provided data
        if (req.body?.username) user.username = req.body.username;
        if (req.body?.email) user.email = req.body.email;
        if (req.body?.password) user.password = req.body.password;

        await user.save();

        res.json({
            message: `Successfully changed ${oldUsername}'s${
                req.body?.username ? ` username to ${user.username}` : ""
            }${req.body?.email ? ` email to ${user.email}` : ""}${
                req.body?.password ? ` password to ${user.password}` : ""
            }
        `,
        });
    } catch (err: unknown) {
        // send an "Internal Server Error" status and the error message
        res.status(500).json(err);
    }
};

// ------------------------ DELETE ------------------------ //
const deleteUser = async (req: Request, res: Response) => {
    // check if the ID is missing or incorrectly formatted
    if (!req?.body?.id || !mongoose.Types.ObjectId.isValid(req?.body?.id)) {
        // send a "Bad Request" status and a descriptive message
        return res.status(400).json({
            message: "ID parameter is missing or incorrectly formatted",
        });
    }

    // check if the user is trying to delete someone else's account
    if (req.body.id !== req.body.currentUserID) {
        // send a "Forbidden" status
        return res.sendStatus(403);
    }
    try {
        const user = await User.findById(req.body.id).exec();

        // check if no user was found
        if (!user) {
            // send a "No Content" status and a descriptive message
            return res
                .status(204)
                .json({ message: `No user matches ID = ${req.params.id}` });
        }

        const oldUsername = user.username;
        await User.deleteOne({ _id: req.body.id });

        res.json({
            message: `Successfully deleted ${oldUsername}'s account`,
        });
    } catch (err: unknown) {
        // send an "Internal Server Error" status and the error message
        res.status(500).json(err);
    }
};

export { createUser, readUser, readAllUsers, updateUser, deleteUser };
