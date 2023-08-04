// Third-Party Modules
import { Schema, model } from "mongoose";

const fileSchema = new Schema<IFile>({
    name: {
        type: String,
        required: true,
    },
    data: {
        type: Buffer,
        required: true,
    },
    mimetype: {
        type: String,
        required: true,
    },
    size: {
        type: Number,
        required: true,
    },
});

export default model<IFile>("File", fileSchema);
