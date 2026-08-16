import express from "express";

import upload from "../middleware/assetupload.js";

import {
    uploadAsset,
    getAssets,
    getAsset,
    updateAsset,
    deleteAsset,
} from "../controllers/assetController.js";

const router = express.Router();



// Upload
router.post(
    "/upload",
    upload.single("file"),
    uploadAsset
);



// Get All
router.get("/", getAssets);



// Get Single
router.get("/:id", getAsset);



// Update
router.put("/:id", updateAsset);



// Delete
router.delete("/:id", deleteAsset);



export default router;