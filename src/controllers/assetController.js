import Asset from "../models/assets.js";
import fs from "fs";
import path from "path";

const getFileType = (mime) => {
    if (mime.startsWith("image")) return "image";
    if (mime.startsWith("video")) return "video";
    if (mime.startsWith("audio")) return "audio";
    if (mime.includes("pdf")) return "pdf";
    if (mime.includes("zip")) return "archive";
    if (
        mime.includes("document") ||
        mime.includes("word") ||
        mime.includes("sheet")
    ) {
        return "document";
    }

    return "other";
};
// Upload Asset
export const uploadAsset = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded",
            });
        }

        const file = req.file;

        const asset = await Asset.create({
            originalName: file.originalname,
            fileName: file.filename,
            filePath: file.path,
            fileUrl: `/${file.path.replace(/\\/g, "/")}`,
            mimeType: file.mimetype,
            extension: path.extname(file.originalname),
            size: file.size,
            type: getFileType(file.mimetype),
            folder: req.body.folder || "general",
            tags: req.body.tags
                ? req.body.tags.split(",")
                : [],
        });

        return res.status(201).json({
            success: true,
            data: asset,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};



// Get All Assets
export const getAssets = async (req, res) => {
    try {
        const assets = await Asset.find()
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: assets.length,
            data: assets,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};



// Get Single Asset
export const getAsset = async (req, res) => {
    try {
        const asset = await Asset.findById(req.params.id);

        if (!asset) {
            return res.status(404).json({
                success: false,
                message: "Asset not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: asset,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};



// Update Asset
export const updateAsset = async (req, res) => {
    try {
        const asset = await Asset.findById(req.params.id);

        if (!asset) {
            return res.status(404).json({
                success: false,
                message: "Asset not found",
            });
        }

        asset.folder = req.body.folder || asset.folder;

        asset.tags = req.body.tags
            ? req.body.tags.split(",")
            : asset.tags;

        await asset.save();

        return res.status(200).json({
            success: true,
            data: asset,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};



// Delete Asset
export const deleteAsset = async (req, res) => {
    try {
        const asset = await Asset.findById(req.params.id);

        if (!asset) {
            return res.status(404).json({
                success: false,
                message: "Asset not found",
            });
        }

        const filePath = path.join(process.cwd(), asset.filePath);

        // Delete file from uploads
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Delete from DB
        await Asset.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Asset deleted successfully",
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};