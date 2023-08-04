// Third-Party Modules
import mongoose, { Schema, model } from "mongoose";

const userSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    displayName: {
        type: String,
        default: "",
    },
    bio: {
        type: String,
        default: "",
    },
    location: {
        type: String,
        default: "",
    },
    pictureID: {
        type: mongoose.Types.ObjectId || null,
        default: null,
    },
    refreshToken: {
        type: [String],
        default: [],
    },
    followerIDs: {
        type: [mongoose.Types.ObjectId],
        default: [],
    },
    followingIDs: {
        type: [mongoose.Types.ObjectId],
        default: [],
    },
});

export default model<IUser>("User", userSchema);
