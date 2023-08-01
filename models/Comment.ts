// Third-Party Modules
import mongoose, { Schema, model } from "mongoose";

const commentSchema = new Schema<IComment>({
    content: {
        type: String,
        required: true,
    },
    userID: {
        type: mongoose.Types.ObjectId || null,
    },
    parentID: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    commentIDs: {
        type: [mongoose.Types.ObjectId],
        default: [],
    },
    date: {
        type: Date,
        required: true,
    },
    likeIDs: {
        type: [mongoose.Types.ObjectId],
        default: [],
    },
});

export default model<IComment>("Comment", commentSchema);
