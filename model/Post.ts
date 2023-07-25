// Third-Party Modules
import { Schema, model } from "mongoose";

const postSchema = new Schema<IPost>({
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
