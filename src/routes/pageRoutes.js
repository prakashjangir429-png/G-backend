import express from "express";

import {
    createWebsiteContent,
    getAllWebsiteContents,
    getWebsiteContentById,
    getWebsiteContentBySlug,
    updateWebsiteContent,
    deleteWebsiteContent,
    getNavbarItems,
    getFooterItems,
} from "../controllers/pageController.js";

const router = express.Router();

router.post("/", createWebsiteContent);

router.get("/", getAllWebsiteContents);

router.get("/navbar", getNavbarItems);

router.get("/footer", getFooterItems);

router.get("/slug/:slug", getWebsiteContentBySlug);

router.get("/:id", getWebsiteContentById);

router.put("/:id", updateWebsiteContent);

router.delete("/:id", deleteWebsiteContent);

export default router;