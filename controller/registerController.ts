// Third-Party Modules
import { Request, Response } from "express";
import bcrypt from "bcrypt";

// Internal Modules
import User from "../model/User";

// function for handling new user registration
const handleNewUser = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    // check for the required attributes
    if (!username || !email || !password) {
        // send a "Bad Request" status and a descriptive message
        res.status(400).json({
            message: "Missing required attributes",
        });
    }

    // check for duplicate usernames or emails
    const isDuplicateUsername = await User.findOne({ username }).exec();
    const isDuplicateEmail = await User.findOne({ email }).exec();
    if (isDuplicateUsername || isDuplicateEmail) {
        // send a "Conflict" status
        return res.sendStatus(409);
    }

    // add the user to the database
    try {
        // encrypt the password
        const encryptedPassword = await bcrypt.hash(password, 10);

        // create and store the new user
        const result = await User.create({
            username: username,
            email: email,
            password: encryptedPassword,
        });

        // send a "Created" status and a descriptive message
        res.status(201).json({
            message: `New user ${username} was registered`,
        });
    } catch (err: any) {
        // send an "Internal Server Error" status and the err message
        res.status(500).json({ message: err.message });
    }
};

export default { handleNewUser };
