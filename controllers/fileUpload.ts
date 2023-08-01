// Core Node Modules
import path from "path";

// Third-Party Modules
import { Request, Response } from "express";
import fileUpload from "express-fileupload";

const MB_COUNT = 10;
const FILE_SIZE_LIMT = MB_COUNT * 1024 * 1024;

const allowedFormats: {
    image?: string[];
    video?: string[];
    audio?: string[];
} = {};

const uploadFiles = async (req: Request, res: Response) => {
    if (!req?.files) {
        // 400 Bad Request
        return res.status(400).send("No files were provided");
    }

    const reqFiles = req.files as fileUpload.FileArray;

    try {
        // check if any files go over the size limit
        const filesOverSizeLimit: string[] = [];
        Object.keys(reqFiles).forEach((key) => {
            const file = reqFiles[key] as fileUpload.UploadedFile;
            if (file.size > FILE_SIZE_LIMT) {
                filesOverSizeLimit.push(file.name);
            }
        });
        if (filesOverSizeLimit.length) {
            // 413 Payload Too Large
            return res.status(413).json({ filesOverSizeLimit });
        }

        // check if the files are of the appropriate formats
        const filesWithWrongFormats: string[] = [];
        Object.keys(reqFiles).forEach((key) => {
            const file = reqFiles[key] as fileUpload.UploadedFile;
            let allowedFormat = false;
            if (req?.body?.image && !allowedFormat) {
                allowedFormats.image = [
                    ".jpg",
                    ".jpeg",
                    ".png",
                    ".gif",
                    ".bmp",
                    ".svg",
                ];
                allowedFormat = allowedFormats.image.includes(
                    path.extname(file.name)
                );
            }
            if (req?.body?.video && !allowedFormat) {
                allowedFormats.video = [
                    ".mp4",
                    ".avi",
                    ".mov",
                    ".mkv",
                    ".wmv",
                    ".flv",
                    ".webm",
                ];
                allowedFormat = allowedFormats.video.includes(
                    path.extname(file.name)
                );
            }
            if (req?.body?.audio && !allowedFormat) {
                allowedFormats.audio = [
                    ".mp3",
                    ".wav",
                    ".ogg",
                    ".aac",
                    ".flac",
                    ".m4a",
                ];
                allowedFormat = allowedFormats.audio.includes(
                    path.extname(file.name)
                );
            }
            if (!allowedFormat) filesWithWrongFormats.push(file.name);
        });
        if (filesWithWrongFormats.length) {
            // 415 Unsupported Media Type
            return res.status(415).json({
                filesWithWrongFormats,
                allowedFormats,
            });
        }

        // upload the files to the server
        Object.keys(reqFiles).forEach((key) => {
            const file = reqFiles[key] as fileUpload.UploadedFile;
            const filePath = path.join(__dirname, "..", "uploads", file.name);
            file.mv(filePath, (err: unknown) => {
                if (err) {
                    // 500 Internal Server Error
                    return res.status(500).json(err);
                }
            });
        });

        // 200 OK
        return res.sendStatus(200);
    } catch (err: unknown) {
        // 500 Internal Server Error
        return res.status(500).json(err);
    }
};

export { uploadFiles };
