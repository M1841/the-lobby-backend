// Core Node Modules
import fs from "fs";
const fsPromises = fs.promises;
import path from "path";

// Third-Party Modules
import { format } from "date-fns";

// general logger function with variable message and file
const logger = async (message: string, file: string) => {
    const dateTime = `${format(new Date(), "yyyy/MM/dd - HH:mm:ss")}`;
    const entry = `${dateTime} | ${message}\n`;

    try {
        // create logs directory if it doesn't exist
        if (!fs.existsSync(path.join(__dirname, "..", "logs"))) {
            await fsPromises.mkdir(path.join(__dirname, "..", "logs"));
        }
        // append current entry to the file
        await fsPromises.appendFile(
            path.join(__dirname, "..", "logs", file),
            entry
        );
    } catch (err: unknown) {
        console.error(err);
    }
};

export default logger;
