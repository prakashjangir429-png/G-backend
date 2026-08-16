import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads";

// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
// }

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folder = req.body.folder || "general";

        const folderPath = path.join(uploadDir, folder);

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        cb(null, folderPath);
    },

    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() + "-" + Math.round(Math.random() * 1e9);

        cb(
            null,
            uniqueName + path.extname(file.originalname)
        );
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: 15 * 1024 * 1024, // 50MB
        files: 10, // max files
    },
});

export default upload;