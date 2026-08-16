import express from "express";

import {
  createNews,
  getAllNews,
  getPublishedNews,
  getNewsById,
  getNewsBySlug,
  getPublishedNewsBySlug,
  updateNews,
  deleteNews,
  updateNewsStatus,
  toggleBreaking,
  toggleFeatured,
  toggleTrending,
  incrementViews,
  incrementLike,
  getRelatedNews,
} from "../controllers/newsController.js";

const router = express.Router();

router.get(
  "/published",
  getPublishedNews
);

router.get(
  "/published/slug/:slug",
  getPublishedNewsBySlug
);

router.get(
  "/",
  getAllNews
);

router.get(
  "/slug/:slug",
  getNewsBySlug
);

router.get(
  "/id/:id",
  getNewsById
);

// Related news
router.get(
  "/:id/related",
  getRelatedNews
);


router.post(
  "/",
  createNews
);

router.put(
  "/:id",
  updateNews
);

// Status
router.patch(
  "/:id/status",
  updateNewsStatus
);

// Breaking
router.patch(
  "/:id/breaking",
  toggleBreaking
);

// Featured
router.patch(
  "/:id/featured",
  toggleFeatured
);

// Trending
router.patch(
  "/:id/trending",
  toggleTrending
);

// Views
router.patch(
  "/:id/view",
  incrementViews
);

// Likes
router.patch(
  "/:id/like",
  incrementLike
);

router.delete(
  "/:id",
  deleteNews
);

export default router;