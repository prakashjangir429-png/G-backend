import express from "express";

import {
    getAllBlogs,
    getBlogById,
    getBlogBySlug,
    createBlog,
    updateBlog,
    deleteBlog,
    updateBlogStatus,
    toggleLike,
    getFeaturedBlogs,
    getBlogStats,
} from "../controllers/blogController.js";

const router = express.Router();

router.get("/", getAllBlogs);

router.get("/featured", getFeaturedBlogs);

router.get("/stats", getBlogStats);

router.get("/slug/:slug", getBlogBySlug);

router.get("/:id", getBlogById);

router.post("/", createBlog);

router.put("/:id", updateBlog);

router.patch("/:id/status", updateBlogStatus);

router.post("/:id/like", toggleLike);

router.delete("/:id", deleteBlog);

export default router;