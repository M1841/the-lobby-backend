// Third-Party Modules
import { Schema, model } from "mongoose";

interface IPost {
    title: string;
    content: string;
    userID: string;
    date: Date;
    likeIDs: string[];
    commentIDs: string[];
}

const postSchema = new Schema<IPost>({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    userID: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    likeIDs: {
        type: [String],
        default: [],
    },
    commentIDs: {
        type: [String],
        default: [],
    },
});

export default model<IPost>("Post", postSchema);
