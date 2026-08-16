import multer from "multer";
import path from "path";
import fs from "fs";

// ensure directory exists
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/";
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// image filter
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("video/") ||
    file.mimetype.startsWith("audio/") ||
    file.mimetype.startsWith("pdf/") ||
    file.mimetype.startsWith("document/")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only image and video files are allowed"));
  }
};

// ✅ FINAL upload middleware (1MB limit + single file with key "file")
export const uploadSingleFile = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // ✅ 10MB
  },
  fileFilter,
}).single("file"); // ✅ important: key must be "file"