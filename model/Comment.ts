// Third-Party Modules
import { Schema, model } from "mongoose";

const commentSchema = new Schema<IComment>({
    content: {
        type: String,
        required: true,
    },
    userID: {
        type: String,
        required: true,
    },
    postID: {
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
});

export default model<IComment>("Comment", commentSchema);
