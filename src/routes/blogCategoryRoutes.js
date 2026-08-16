import express from "express";

import {
    getAllCategories,
    getCategoryById,
    getCategoryBySlug,
    createCategory,
    updateCategory,
    deleteCategory,
    deleteCategoryPermanent,
} from "../controllers/blogcatController.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Blog Category Routes
|--------------------------------------------------------------------------
*/

// Get all categories
// GET /api/blog-categories
router.get("/", getAllCategories);

// Get category by slug
// GET /api/blog-categories/slug/:slug
router.get("/slug/:slug", getCategoryBySlug);

// Get category by ID
// GET /api/blog-categories/:id
router.get("/:id", getCategoryById);

// Create category
// POST /api/blog-categories
router.post("/", createCategory);

// Update category
// PUT /api/blog-categories/:id
router.put("/:id", updateCategory);

// Soft delete category
// DELETE /api/blog-categories/:id
router.delete("/:id", deleteCategory);

// Permanent delete category
// DELETE /api/blog-categories/:id/permanent
router.delete(
    "/:id/permanent",
    deleteCategoryPermanent
);

export default router;