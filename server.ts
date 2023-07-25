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
import authRoute from "./routes/api/auth";
import postsRoute from "./routes/api/posts";
import usersRoute from "./routes/api/users";
import rootRoute from "./routes/root";

// -------------------- INITIALIZATION -------------------- //
dotenv.config();
const app: Express = express();
const port: string = process.env.PORT || "8080";
connectDB();

// ---------------------- MIDDLEWARE ---------------------- //
// Handle Cross-Origin Resource Sharing
app.use(cors(corsOptions));
app.use(credentials);

// Handle Unencoded Form Data
app.use(express.urlencoded({ extended: false }));

// Parse request bodies as JSON
app.use(express.json());

// Parse cookies
app.use(cookieParser());

// ------------------------ ROUTES ------------------------ //
// User Authentication
app.use("/api/auth", authRoute);

// CRUD Post Operations
app.use("/api/posts", postsRoute);

// CRUD User Operations
app.use("/api/users", usersRoute);

// Root Redirect
app.use("/*", rootRoute);

// ---------------- LISTEN FOR CONNECTIONS ---------------- //
mongoose.connection.once("open", () => {
    console.log("[server]: Connected to MongoDB");

    app.listen(port, () => {
        console.log(`[server]: Server running at http://localhost:${port}`);
    });
});
