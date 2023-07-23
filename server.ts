// Third-Party Modules
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

// Internal Modules
import connectDB from "./config/connectDB";
import corsOptions from "./config/corsOptions";
import credentials from "./middleware/credentials";
import { reqLogger, errLogger } from "./middleware/loggers";
import registerRoute from "./routes/register";
import authRoute from "./routes/auth";
import logoutRoute from "./routes/logout";
import refreshRoute from "./routes/refresh";
import postsRoute from "./routes/api/posts";

// Initialize App
dotenv.config();
const app: Express = express();
const port: string = process.env.PORT || "8080";

// Connect to MongoDB
connectDB();

// Handle Cross-Origin Resource Sharing
app.use(cors(corsOptions));
app.use(credentials);

// Log Requests
app.use(reqLogger);

// Handle Unencoded Form Data
app.use(express.urlencoded({ extended: false }));

// Parse request bodies as JSON
app.use(express.json());

// Parse cookies
app.use(cookieParser());

// Handle User Registration
app.use("/register", registerRoute);
// Handle User Authentication
app.use("/auth", authRoute);
// Handle User Logout
app.use("/logout", logoutRoute);
// Refresh the Access Token
app.use("/refresh", refreshRoute);

// CRUD Post Operations
app.use("/posts", postsRoute);

// Log Errors
app.use(errLogger);

// Listen for Requests
mongoose.connection.once("open", () => {
    console.log("[server]: Connected to MongoDB");

    app.listen(port, () => {
        console.log(`[server]: Server running at http://localhost:${port}`);
    });
});
