// Third-Party Modules
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

// Internal Modules
import User from "../model/User";

const isValidID = mongoose.Types.ObjectId.isValid;

// ------------------------ CREATE ------------------------ //
const createNewUser = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    // check for the required attributes
    if (!username || !email || !password) {
        let missingFields: {
            username?: string;
            email?: string;
            password?: string;
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
                username?: string;
                email?: string;
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
            const { _id, username } = user;
            return { _id, username };
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

        return res.json({ _id: user._id, username: user.username });
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

        // update the user based on the provided data
        if (req.body?.username) user.username = req.body.username;

        if (req.body?.email) user.email = req.body.email;

        if (req.body?.password)
            user.password = await bcrypt.hash(req.body.password, 10);

        await user.save();

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
    deleteUserById,
};
