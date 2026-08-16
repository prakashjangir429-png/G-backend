// models/Asset.js

import mongoose from "mongoose";

const assetSchema = new mongoose.Schema(
    {
        originalName: {
            type: String,
            required: true,
        },

        fileName: {
            type: String,
            required: true,
        },

        filePath: {
            type: String,
            required: true,
        },

        fileUrl: {
            type: String,
            required: true,
        },

        mimeType: {
            type: String,
        },

        extension: {
            type: String,
        },

        size: {
            type: Number,
        },

        type: {
            type: String,
            enum: [
                "image",
                "video",
                "audio",
                "document",
                "pdf",
                "archive",
                "other",
            ],
            default: "other",
        },

        folder: {
            type: String,
            default: "general",
        },

        tags: [String],

        isDeleted: {
            type: Boolean,
            default: false,
        },

        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Asset", assetSchema);