// Third-Party Modules
import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URI as string);
    } catch (err: unknown) {
        console.error(err);
    }
};

export default connectDB;
