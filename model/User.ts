// Third-Party Modules
import { Schema, model } from "mongoose";

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
    refreshToken: {
        type: [String],
        default: [],
    },
});

export default model<IUser>("User", userSchema);
