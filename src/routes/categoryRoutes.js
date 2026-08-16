import express from "express";

import {
    createCategory,
    getCategories,
    getCategoryById,
    getCategoryBySlug,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
/////
    createSubCategory,
    getSubCategories,
    getSubCategoryById,
    getSubCategoryBySlug,
    updateSubCategory,
    deleteSubCategory,
    toggleSubCategoryStatus,
} from "../controllers/categoryController.js";

const router = express.Router();

router.get("/", getCategories);
router.get("/slug/:slug", getCategoryBySlug);
router.get("/id/:id", getCategoryById);
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.patch("/:id/status", toggleCategoryStatus);
router.delete("/:id", deleteCategory);



router.get("/sub/", getSubCategories);
router.get("/sub/slug/:slug", getSubCategoryBySlug);
router.get("/sub/id/:id", getSubCategoryById);
router.post("/sub/", createSubCategory);
router.put("/sub/:id", updateSubCategory);
router.patch("/sub/:id/status", toggleSubCategoryStatus);
router.delete("/sub/:id", deleteSubCategory);

export default router;