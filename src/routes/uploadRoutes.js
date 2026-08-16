import express from "express";
import { uploadSingleFile } from "../middleware/upload.js";

const router = express.Router();

router.post("/single", (req, res) => {
  uploadSingleFile(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        message: err.message,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    res.json({
      message: "File uploaded successfully",
      url: `${req.file.filename}`,
    });
  });
});

export default router;