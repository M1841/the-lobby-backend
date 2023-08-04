// Third-Party Modules
import mongoose, { Schema, model } from "mongoose";

const postSchema = new Schema<IPost>({
    content: {
        type: String,
        required: true,
    },
    userID: {
        type: mongoose.Types.ObjectId || null,
        default: null,
    },
    date: {
        type: Date,
        required: true,
    },
    mediaIDs: {
        type: [mongoose.Types.ObjectId],
        default: [],
    },
    likeIDs: {
        type: [mongoose.Types.ObjectId],
        default: [],
    },
    commentIDs: {
        type: [mongoose.Types.ObjectId],
        default: [],
    },
});

export default model<IPost>("Post", postSchema);
