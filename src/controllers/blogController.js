import { Blog, BlogCategory } from "../models/blogs.js";

// ─── Helper Functions ──────────────────────────────────────────────────────

const generateSlug = (text) => {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
};

const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content
        .replace(/<[^>]*>/g, "")
        .split(/\s+/)
        .length;

    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
};

const buildFilterQuery = (query) => {
    const filter = {};

    // Status filter
    if (query.status && query.status !== "all") {
        filter.status = query.status;
    }

    // Category filter
    if (query.category && query.category !== "all") {
        filter.category = query.category;
    }

    // Featured filter
    if (query.featured === "true") {
        filter.featured = true;
    }

    // Search filter
    if (query.search) {
        filter.$or = [
            {
                title: {
                    $regex: query.search,
                    $options: "i",
                },
            },
            {
                content: {
                    $regex: query.search,
                    $options: "i",
                },
            },
            {
                excerpt: {
                    $regex: query.search,
                    $options: "i",
                },
            },
            {
                tags: {
                    $in: [new RegExp(query.search, "i")],
                },
            },
        ];
    }

    // Tags filter
    if (query.tags) {
        const tagsArray = query.tags
            .split(",")
            .map((tag) => tag.trim());

        filter.tags = {
            $in: tagsArray,
        };
    }

    return filter;
};

// ─── Controllers ──────────────────────────────────────────────────────────

/**
 * GET /api/blogs
 * Get all blogs with pagination, search, and filters
 */
export async function getAllBlogs(req, res) {
    try {
        const {
            page = 1,
            limit = 10,
            sortBy = "createdAt",
            sortOrder = "desc",
            status = "draft",
            category,
            featured,
            search,
            tags,
        } = req.query;

        const filter = buildFilterQuery({
            status,
            category,
            featured,
            search,
            tags,
        });

        // Sort
        const sort = {};
        sort[sortBy] = sortOrder === "asc" ? 1 : -1;

        // Pagination
        const currentPage = parseInt(page);
        const limitValue = parseInt(limit);
        const skip = (currentPage - 1) * limitValue;

        const [blogs, totalCount] = await Promise.all([
            Blog.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limitValue)
                .lean(),

            Blog.countDocuments(filter),
        ]);

        // Get category names
        const categorySlugs = [
            ...new Set(
                blogs
                    .map((blog) => blog.category)
                    .filter(Boolean)
            ),
        ];

        const categories = await BlogCategory.find({
            slug: { $in: categorySlugs },
        });

        const categoryMap = categories.reduce((acc, cat) => {
            acc[cat.slug] = cat.name;
            return acc;
        }, {});

        // Add category name
        const enhancedBlogs = blogs.map((blog) => ({
            ...blog,
            categoryName:
                categoryMap[blog.category] || blog.category,
        }));

        const totalPages = Math.ceil(totalCount / limitValue);

        return res.json({
            success: true,
            data: enhancedBlogs,
            pagination: {
                page: currentPage,
                limit: limitValue,
                totalCount,
                totalPages,
                hasNextPage: currentPage < totalPages,
                hasPrevPage: currentPage > 1,
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
 * GET /api/blogs/:id
 * Get a single blog by ID
 */
export async function getBlogById(req, res) {
    try {
        const { id } = req.params;

        const blog = await Blog.findById(id).lean();

        if (!blog) {
            return res.status(404).json({
                success: false,
                error: "Blog not found",
            });
        }

        // Increment views
        await Blog.findByIdAndUpdate(id, {
            $inc: { views: 1 },
        });

        // Get category name
        let categoryName = blog.category;

        if (blog.category) {
            const category = await BlogCategory.findOne({
                slug: blog.category,
            });

            if (category) {
                categoryName = category.name;
            }
        }

        // Related blogs
        const relatedBlogs = await Blog.find({
            category: blog.category,
            status: "published",
            _id: { $ne: blog._id },
        })
            .sort({ createdAt: -1 })
            .limit(3)
            .select("title slug featuredImage excerpt createdAt")
            .lean();

        return res.json({
            success: true,
            data: {
                ...blog,
                categoryName,
                relatedBlogs,
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
 * GET /api/blogs/slug/:slug
 * Get a single blog by slug
 */
export async function getBlogBySlug(req, res) {
    try {
        const { slug } = req.params;

        const blog = await Blog.findOne({
            slug,
        }).lean();

        if (!blog) {
            return res.status(404).json({
                success: false,
                error: "Blog not found",
            });
        }

        // Increment views
        await Blog.findOneAndUpdate(
            { slug },
            {
                $inc: {
                    views: 1,
                },
            }
        );

        // Get category name
        let categoryName = blog.category;

        if (blog.category) {
            const category = await BlogCategory.findOne({
                slug: blog.category,
            });

            if (category) {
                categoryName = category.name;
            }
        }

        // Related blogs
        const relatedBlogs = await Blog.find({
            category: blog.category,
            status: "published",
            _id: { $ne: blog._id },
        })
            .sort({ createdAt: -1 })
            .limit(3)
            .select("title slug featuredImage excerpt createdAt")
            .lean();

        return res.json({
            success: true,
            data: {
                ...blog,
                categoryName,
                relatedBlogs,
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
 * POST /api/blogs
 * Create a new blog
 */
export async function createBlog(req, res) {
    try {
        const blogData = {
            ...req.body,
        };

        // Generate slug if not provided
        if (!blogData.slug) {
            blogData.slug = generateSlug(blogData.title);
        }

        // Check slug
        const existingBlog = await Blog.findOne({
            slug: blogData.slug,
        });

        if (existingBlog) {
            return res.status(400).json({
                success: false,
                error: "Slug already exists. Please choose a different slug.",
            });
        }

        // Calculate read time
        if (blogData.content) {
            blogData.readTime = calculateReadTime(
                blogData.content
            );
        }

        // Generate excerpt
        if (!blogData.excerpt && blogData.content) {
            const plainText = blogData.content.replace(
                /<[^>]*>/g,
                ""
            );

            blogData.excerpt =
                plainText.substring(0, 150) + "...";
        }

        // Validate category
        if (blogData.category) {
            const category = await BlogCategory.findOne({
                slug: blogData.category,
            });

            if (!category) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid category. Please provide a valid category slug.",
                });
            }
        }

        const blog = await Blog.create(blogData);

        // Get category name
        let categoryName = blog.category;

        if (blog.category) {
            const category = await BlogCategory.findOne({
                slug: blog.category,
            });

            if (category) {
                categoryName = category.name;
            }
        }

        return res.status(201).json({
            success: true,
            data: {
                ...blog.toObject(),
                categoryName,
            },
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message,
        });
    }
}

/**
 * PUT /api/blogs/:id
 * Update a blog
 */
export async function updateBlog(req, res) {
    try {
        const { id } = req.params;

        const updateData = {
            ...req.body,
        };

        // Check existing blog
        const existingBlog = await Blog.findById(id);

        if (!existingBlog) {
            return res.status(404).json({
                success: false,
                error: "Blog not found",
            });
        }

        // Check slug uniqueness
        if (
            updateData.slug &&
            updateData.slug !== existingBlog.slug
        ) {
            const slugExists = await Blog.findOne({
                slug: updateData.slug,
                _id: { $ne: id },
            });

            if (slugExists) {
                return res.status(400).json({
                    success: false,
                    error: "Slug already exists. Please choose a different slug.",
                });
            }
        }

        // Recalculate read time
        if (updateData.content) {
            updateData.readTime = calculateReadTime(
                updateData.content
            );
        }

        // Update excerpt
        if (
            updateData.content &&
            !updateData.excerpt
        ) {
            const plainText = updateData.content.replace(
                /<[^>]*>/g,
                ""
            );

            updateData.excerpt =
                plainText.substring(0, 150) + "...";
        }

        // Validate category
        if (updateData.category) {
            const category = await BlogCategory.findOne({
                slug: updateData.category,
            });

            if (!category) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid category. Please provide a valid category slug.",
                });
            }
        }

        const blog = await Blog.findByIdAndUpdate(
            id,
            {
                ...updateData,
                updatedAt: new Date(),
            },
            {
                new: true,
                runValidators: true,
            }
        ).lean();

        // Get category name
        let categoryName = blog.category;

        if (blog.category) {
            const category = await BlogCategory.findOne({
                slug: blog.category,
            });

            if (category) {
                categoryName = category.name;
            }
        }

        return res.json({
            success: true,
            data: {
                ...blog,
                categoryName,
            },
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message,
        });
    }
}

/**
 * DELETE /api/blogs/:id
 * Delete a blog
 */
export async function deleteBlog(req, res) {
    try {
        const { id } = req.params;

        const blog = await Blog.findByIdAndDelete(id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                error: "Blog not found",
            });
        }

        return res.json({
            success: true,
            message: "Blog deleted successfully",
            data: blog,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
}

/**
 * PATCH /api/blogs/:id/status
 * Update blog status
 */
export async function updateBlogStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                error: "Status is required",
            });
        }

        const blog = await Blog.findByIdAndUpdate(
            id,
            {
                status,
                updatedAt: new Date(),
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!blog) {
            return res.status(404).json({
                success: false,
                error: "Blog not found",
            });
        }

        return res.json({
            success: true,
            data: blog,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message,
        });
    }
}

/**
 * POST /api/blogs/:id/like
 * Toggle like on a blog
 */
export async function toggleLike(req, res) {
    try {
        const { id } = req.params;

        const blog = await Blog.findById(id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                error: "Blog not found",
            });
        }

        // Simple like implementation
        blog.likes = (blog.likes || 0) + 1;

        await blog.save();

        return res.json({
            success: true,
            data: {
                likes: blog.likes,
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
 * GET /api/blogs/featured
 * Get featured blogs
 */
export async function getFeaturedBlogs(req, res) {
    try {
        const { limit = 5 } = req.query;

        const blogs = await Blog.find({
            featured: true,
            status: "published",
        })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .lean();

        return res.json({
            success: true,
            data: blogs,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
}

/**
 * GET /api/blogs/stats
 * Get blog statistics
 */
export async function getBlogStats(req, res) {
    try {
        const [
            total,
            published,
            draft,
            archived,
            pending,
            featured,
            totalViews,
            totalLikes,
        ] = await Promise.all([
            Blog.countDocuments(),

            Blog.countDocuments({
                status: "published",
            }),

            Blog.countDocuments({
                status: "draft",
            }),

            Blog.countDocuments({
                status: "archived",
            }),

            Blog.countDocuments({
                status: "pending",
            }),

            Blog.countDocuments({
                featured: true,
            }),

            Blog.aggregate([
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$views",
                        },
                    },
                },
            ]),

            Blog.aggregate([
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$likes",
                        },
                    },
                },
            ]),
        ]);

        // Category statistics
        const categoryStats = await Blog.aggregate([
            {
                $match: {
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
            {
                $sort: {
                    count: -1,
                },
            },
            {
                $limit: 10,
            },
        ]);

        return res.json({
            success: true,
            data: {
                total,
                published,
                draft,
                archived,
                pending,
                featured,
                totalViews: totalViews[0]?.total || 0,
                totalLikes: totalLikes[0]?.total || 0,
                categoryStats,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
}