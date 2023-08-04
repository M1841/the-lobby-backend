// Core Node Modules
import path from "path";

// Third-Party Modules
import { Request, Response } from "express";
import fileUpload from "express-fileupload";
import mongoose from "mongoose";

// Internal Modules
import File from "../models/File";

// constants
const MB_COUNT = 16;
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
        return res
            .status(413)
            .json({ sizeLimit: `${MB_COUNT} MB`, filesOverSizeLimit });
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

    try {
        const fileIDs: mongoose.Types.ObjectId[] = [];
        // upload the files to the database
        for (const key of Object.keys(reqFiles)) {
            const inputFile = reqFiles[key] as fileUpload.UploadedFile;
            const outputFile = await File.create({
                name: inputFile.name,
                data: inputFile.data,
                mimetype: inputFile.mimetype,
                size: inputFile.size,
            });
            fileIDs.push(outputFile._id);
        }

        return fileIDs;
    } catch (err: unknown) {
        // 500 Internal Server Error
        return res.status(500).json(err);
    }
};

export { uploadFiles };
