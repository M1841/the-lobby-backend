// Third-Party Modules
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

// Internal Modules
import connectDB from "./config/connectDB";
import corsOptions from "./config/corsOptions";
import setCorsHeaders from "./middleware/setCorsHeaders";

import rootRoute from "./routes/root";
import authRoute from "./routes/api/auth";
import usersRoute from "./routes/api/users";
import postsRoute from "./routes/api/posts";
import commentsRoute from "./routes/api/comments";
import searchRoute from "./routes/api/search";
import uploadsRoute from "./routes/uploads";

// -------------------- INITIALIZATION -------------------- //
dotenv.config();
const app: Express = express();
const port: string = process.env.PORT || "8080";
connectDB();

// ---------------------- MIDDLEWARE ---------------------- //
// Handle Cross-Origin Resource Sharing
app.use(cors(corsOptions));
app.use(setCorsHeaders);

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: false }));

// Parse request bodies as JSON
app.use(express.json());

// Parse cookies
app.use(cookieParser());

// ------------------------ ROUTES ------------------------ //
// User Authentication
app.use("/api/auth", authRoute);

// CRUD User Operations
app.use("/api/users", usersRoute);

// CRUD Post Operations
app.use("/api/posts", postsRoute);

// CRUD Comment Operations
app.use("/api/comments", commentsRoute);

// Search
app.use("/api/search", searchRoute);

// Uploaded Files
app.use("/uploads", uploadsRoute);

// Root Redirect
app.use("/*", rootRoute);

// ---------------- LISTEN FOR CONNECTIONS ---------------- //
mongoose.connection.once("open", () => {
    console.log("[server]: Connected to MongoDB");

    app.listen(port, () => {
        console.log(`[server]: Server running at http://localhost:${port}`);
    });
});
