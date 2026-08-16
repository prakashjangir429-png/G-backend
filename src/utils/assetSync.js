import fs from "fs";
import path from "path";
import Asset from "../models/assets.js";

const uploadsDir = path.join(process.cwd(), "uploads");

const getFileType = (mime) => {
    if (!mime) return "other";

    if (mime.startsWith("image")) return "image";
    if (mime.startsWith("video")) return "video";
    if (mime.startsWith("audio")) return "audio";
    if (mime.includes("pdf")) return "pdf";
    if (mime.includes("zip")) return "archive";

    return "document";
};

const getMimeTypeFromExtension = (ext) => {
    const map = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
        ".mp4": "video/mp4",
        ".mp3": "audio/mpeg",
        ".pdf": "application/pdf",
        ".doc": "application/msword",
        ".docx":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".xls": "application/vnd.ms-excel",
        ".xlsx":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ".zip": "application/zip",
    };

    return map[ext.toLowerCase()] || "application/octet-stream";
};

const scanDirectory = async (dir, baseFolder = "") => {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);

        const stat = fs.statSync(fullPath);

        // Folder
        if (stat.isDirectory()) {
            await scanDirectory(
                fullPath,
                path.join(baseFolder, file)
            );

            continue;
        }

        // Check already exists
        const existing = await Asset.findOne({
            filePath: fullPath,
        });

        if (existing) continue;

        const extension = path.extname(file);

        const mimeType =
            getMimeTypeFromExtension(extension);

        const relativePath = path
            .relative(process.cwd(), fullPath)
            .replace(/\\/g, "/");

        const folderName =
            baseFolder.split(path.sep)[0] || "general";

        await Asset.create({
            originalName: file,
            fileName: file,
            filePath: relativePath,
            fileUrl: `/${relativePath}`,
            mimeType,
            extension,
            size: stat.size,
            type: getFileType(mimeType),
            folder: folderName,
        });

        console.log("Synced:", file);
    }
};

export const syncUploadsToAssets = async () => {
    try {
        if (!fs.existsSync(uploadsDir)) {
            console.log("Uploads folder not found");
            return;
        }

        await scanDirectory(uploadsDir);

        console.log("Assets sync completed");
    } catch (error) {
        console.log("Sync Error:", error);
    }
};