import { BlogCategory, Blog } from "../models/blogs.js";

// ─── Helper Functions ──────────────────────────────────────────────────────

const generateSlug = (text) => {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
};

// ─── Controllers ──────────────────────────────────────────────────────────

/**
 * GET /api/blog-categories
 * Get all categories with pagination, search and filters
 */
export async function getAllCategories(req, res) {
    try {
        const {
            page = 1,
            limit = 20,
            search,
            isActive,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = req.query;

        // Build filter
        const filter = {};

        if (isActive !== undefined) {
            filter.isActive = isActive === "true";
        }

        if (search) {
            filter.$or = [
                {
                    name: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    slug: {
                        $regex: search,
                        $options: "i",
                    },
                },
            ];
        }

        // Build sort
        const sort = {};
        sort[sortBy] = sortOrder === "asc" ? 1 : -1;

        // Pagination
        const currentPage = parseInt(page);
        const limitValue = parseInt(limit);
        const skip = (currentPage - 1) * limitValue;

        // Get categories
        const [categories, totalCount] = await Promise.all([
            BlogCategory.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limitValue)
                .lean(),

            BlogCategory.countDocuments(filter),
        ]);

        // Get blog counts
        const categorySlugs = categories.map(
            (category) => category.slug
        );

        const blogCounts = await Blog.aggregate([
            {
                $match: {
                    category: {
                        $in: categorySlugs,
                    },
                    status: "published",
                },
            },
            {
                $group: {
                    _id: "$category",
                    count: {
                        $sum: 1,
                    },
                },
            },
        ]);

        const blogCountMap = blogCounts.reduce(
            (acc, item) => {
                acc[item._id] = item.count;
                return acc;
            },
            {}
        );

        // Add blog count
        const enhancedCategories = categories.map(
            (category) => ({
                ...category,
                blogCount:
                    blogCountMap[category.slug] || 0,
            })
        );

        const totalPages = Math.ceil(
            totalCount / limitValue
        );

        return res.json({
            success: true,
            data: enhancedCategories,
            pagination: {
                page: currentPage,
                limit: limitValue,
                totalCount,
                totalPages,
                hasNextPage:
                    currentPage < totalPages,
                hasPrevPage:
                    currentPage > 1,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
}

/**
 * GET /api/blog-categories/:id
 * Get category by ID
 */
export async function getCategoryById(req, res) {
    try {
        const { id } = req.params;

        const category =
            await BlogCategory.findById(id).lean();

        if (!category) {
            return res.status(404).json({
                success: false,
                error: "Category not found",
            });
        }

        // Get blog count
        const blogCount =
            await Blog.countDocuments({
                category: category.slug,
                status: "published",
            });

        // Get recent blogs
        const recentBlogs = await Blog.find({
            category: category.slug,
            status: "published",
        })
            .sort({ createdAt: -1 })
            .limit(5)
            .select(
                "title slug featuredImage excerpt createdAt"
            )
            .lean();

        return res.json({
            success: true,
            data: {
                ...category,
                blogCount,
                recentBlogs,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
}

/**
 * GET /api/blog-categories/slug/:slug
 * Get category by slug
 */
export async function getCategoryBySlug(req, res) {
    try {
        const { slug } = req.params;

        const category =
            await BlogCategory.findOne({
                slug,
                isActive: true,
            }).lean();

        if (!category) {
            return res.status(404).json({
                success: false,
                error: "Category not found",
            });
        }

        // Get blog count
        const blogCount =
            await Blog.countDocuments({
                category: category.slug,
                status: "published",
            });

        const {
            page = 1,
            limit = 10,
        } = req.query;

        const currentPage = parseInt(page);
        const limitValue = parseInt(limit);

        const skip =
            (currentPage - 1) * limitValue;

        const [
            blogs,
            totalBlogs,
        ] = await Promise.all([
            Blog.find({
                category: category.slug,
                status: "published",
            })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitValue)
                .select(
                    "title slug featuredImage excerpt createdAt views likes"
                )
                .lean(),

            Blog.countDocuments({
                category: category.slug,
                status: "published",
            }),
        ]);

        return res.json({
            success: true,
            data: {
                ...category,
                blogCount,
                blogs: {
                    data: blogs,
                    pagination: {
                        page: currentPage,
                        limit: limitValue,
                        totalCount: totalBlogs,
                        totalPages:
                            Math.ceil(
                                totalBlogs /
                                    limitValue
                            ),
                        hasNextPage:
                            currentPage <
                            Math.ceil(
                                totalBlogs /
                                    limitValue
                            ),
                        hasPrevPage:
                            currentPage > 1,
                    },
                },
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
}

/**
 * POST /api/blog-categories
 * Create category
 */
export async function createCategory(req, res) {
    try {
        const categoryData = {
            ...req.body,
        };

        // Generate slug
        if (!categoryData.slug) {
            categoryData.slug =
                generateSlug(categoryData.name);
        }

        // Check slug
        const existingCategory =
            await BlogCategory.findOne({
                slug: categoryData.slug,
            });

        if (existingCategory) {
            return res.status(400).json({
                success: false,
                error: "Category with this slug already exists",
            });
        }

        // Check name
        const existingName =
            await BlogCategory.findOne({
                name: categoryData.name,
            });

        if (existingName) {
            return res.status(400).json({
                success: false,
                error: "Category with this name already exists",
            });
        }

        const category =
            await BlogCategory.create(categoryData);

        return res.status(201).json({
            success: true,
            data: category,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message,
        });
    }
}

/**
 * PUT /api/blog-categories/:id
 * Update category
 */
export async function updateCategory(req, res) {
    try {
        const { id } = req.params;

        const updateData = {
            ...req.body,
        };

        // Check category
        const existingCategory =
            await BlogCategory.findById(id);

        if (!existingCategory) {
            return res.status(404).json({
                success: false,
                error: "Category not found",
            });
        }

        // Check slug uniqueness
        if (
            updateData.slug &&
            updateData.slug !==
                existingCategory.slug
        ) {
            const slugExists =
                await BlogCategory.findOne({
                    slug: updateData.slug,
                    _id: {
                        $ne: id,
                    },
                });

            if (slugExists) {
                return res.status(400).json({
                    success: false,
                    error: "Category with this slug already exists",
                });
            }
        }

        // Check name uniqueness
        if (
            updateData.name &&
            updateData.name !==
                existingCategory.name
        ) {
            const nameExists =
                await BlogCategory.findOne({
                    name: updateData.name,
                    _id: {
                        $ne: id,
                    },
                });

            if (nameExists) {
                return res.status(400).json({
                    success: false,
                    error: "Category with this name already exists",
                });
            }
        }

        const category =
            await BlogCategory.findByIdAndUpdate(
                id,
                {
                    ...updateData,
                    updatedAt: new Date(),
                },
                {
                    new: true,
                    runValidators: true,
                }
            );

        return res.json({
            success: true,
            data: category,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message,
        });
    }
}

/**
 * DELETE /api/blog-categories/:id
 * Soft delete category
 */
export async function deleteCategory(req, res) {
    try {
        const { id } = req.params;

        const category =
            await BlogCategory.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                error: "Category not found",
            });
        }

        // Check blogs
        const blogCount =
            await Blog.countDocuments({
                category: category.slug,
            });

        if (blogCount > 0) {
            return res.status(400).json({
                success: false,
                error: `Cannot delete category. ${blogCount} blog(s) are using this category.`,
            });
        }

        // Soft delete
        category.isActive = false;

        await category.save();

        return res.json({
            success: true,
            message: "Category deleted successfully",
            data: category,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
}

/**
 * DELETE /api/blog-categories/:id/permanent
 * Permanently delete category
 */
export async function deleteCategoryPermanent(
    req,
    res
) {
    try {
        const { id } = req.params;

        const category =
            await BlogCategory.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                error: "Category not found",
            });
        }

        // Check blogs
        const blogCount =
            await Blog.countDocuments({
                category: category.slug,
            });

        if (blogCount > 0) {
            return res.status(400).json({
                success: false,
                error: `Cannot delete category. ${blogCount} blog(s) are using this category. Please reassign them first.`,
            });
        }

        await BlogCategory.findByIdAndDelete(id);

        return res.json({
            success: true,
            message:
                "Category permanently deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
}