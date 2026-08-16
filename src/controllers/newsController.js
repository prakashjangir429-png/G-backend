import mongoose from "mongoose";
import News from "../NewsModals/News.js";
import Category from "../NewsModals/Category.js";
import SubCategory from "../NewsModals/SubCategory.js";


const escapeRegex = (value = "") => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const parseBoolean = (value) => {
    if (value === undefined) return undefined;

    if (value === true || value === "true" || value === "1") {
        return true;
    }

    if (value === false || value === "false" || value === "0") {
        return false;
    }

    return undefined;
};

const parseObjectIds = (value) => {
    if (!value) return [];

    const values = Array.isArray(value)
        ? value
        : value.split(",");

    return values
        .map((item) => item.trim())
        .filter((item) => mongoose.Types.ObjectId.isValid(item));
};

const getPagination = (query) => {
    const page = Math.max(parseInt(query.page) || 1, 1);

    const limit = Math.min(
        Math.max(parseInt(query.limit) || 10, 1),
        100
    );

    return {
        page,
        limit,
        skip: (page - 1) * limit,
    };
};

const newsPopulate = [
    {
        path: "category",
        select:
            "name hiName slug hiSlug icon color isNavbar hasDropdown isActive order",
    },
    {
        path: "subCategory",
        select:
            "name hiName slug hiSlug category isActive order",
    }
];


const buildNewsFilter = async (query, publicOnly = false) => {
    const filter = {};

    const {
        search,
        title,
        hiTitle,
        slug,
        hiSlug,

        type,
        author,

        category,
        categorySlug,

        subCategory,
        subCategorySlug,

        tags,

        status,

        isBreaking,
        isFeatured,
        isTrending,

        minViews,
        maxViews,

        minLikes,
        maxLikes,

        minReadTime,
        maxReadTime,

        publishedFrom,
        publishedTo,

        scheduledFrom,
        scheduledTo,

        createdFrom,
        createdTo,

        source,
        hasImage,
        hasVideo,
    } = query;

    /* -----------------------------------------
       Public filter
    ----------------------------------------- */

    if (publicOnly) {
        filter.status = "published";

        filter.$and = [
            {
                $or: [
                    { publishedAt: { $lte: new Date() } },
                    { publishedAt: null },
                ],
            },
        ];
    }

    /* -----------------------------------------
       Global search
    ----------------------------------------- */

    if (search?.trim()) {
        const regex = new RegExp(
            escapeRegex(search.trim()),
            "i"
        );

        filter.$or = [
            { title: regex },
            { hiTitle: regex },
            { slug: regex },
            { hiSlug: regex },
            { summary: regex },
            { hiSummary: regex },
            { content: regex },
            { hiContent: regex },
            { author: regex },
            { metaTitle: regex },
            { metaDescription: regex },
            { metaKeywords: regex },
            { hiMetaTitle: regex },
            { hiMetaDescription: regex },
            { hiMetaKeywords: regex },
            { "source.name": regex },
        ];
    }

    /* -----------------------------------------
       Exact/partial fields
    ----------------------------------------- */

    if (title) {
        filter.title = new RegExp(
            escapeRegex(title),
            "i"
        );
    }

    if (hiTitle) {
        filter.hiTitle = new RegExp(
            escapeRegex(hiTitle),
            "i"
        );
    }

    if (slug) {
        filter.slug = slug.toLowerCase().trim();
    }

    if (hiSlug) {
        filter.hiSlug = hiSlug.toLowerCase().trim();
    }

    if (type) {
        filter.type = type;
    }

    if (author) {
        filter.author = new RegExp(
            escapeRegex(author),
            "i"
        );
    }

    if (source) {
        filter["source.name"] = new RegExp(
            escapeRegex(source),
            "i"
        );
    }

    /* -----------------------------------------
       Status
    ----------------------------------------- */

    if (!publicOnly && status) {
        const statuses = status
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);

        if (statuses.length === 1) {
            filter.status = statuses[0];
        } else {
            filter.status = {
                $in: statuses,
            };
        }
    }

    /* -----------------------------------------
       Category ID
    ----------------------------------------- */

    if (category) {
        const categoryIds = parseObjectIds(category);

        if (categoryIds.length === 1) {
            filter.category = categoryIds[0];
        } else if (categoryIds.length > 1) {
            filter.category = {
                $in: categoryIds,
            };
        }
    }

    /* -----------------------------------------
       Category slug
       English + Hindi supported
    ----------------------------------------- */

    if (categorySlug) {
        const categorySlugs = categorySlug
            .split(",")
            .map((item) =>
                decodeURIComponent(item)
                    .toLowerCase()
                    .trim()
            )
            .filter(Boolean);

        const categories = await Category.find({
            $or: [
                {
                    slug: {
                        $in: categorySlugs,
                    },
                },
                {
                    hiSlug: {
                        $in: categorySlugs,
                    },
                },
            ],
        }).select("_id");

        filter.category = {
            $in: categories.map((item) => item._id),
        };
    }

    /* -----------------------------------------
       SubCategory ID
    ----------------------------------------- */

    if (subCategory) {
        const subCategoryIds =
            parseObjectIds(subCategory);

        if (subCategoryIds.length === 1) {
            filter.subCategory =
                subCategoryIds[0];
        } else if (subCategoryIds.length > 1) {
            filter.subCategory = {
                $in: subCategoryIds,
            };
        }
    }

    /* -----------------------------------------
       SubCategory slug
    ----------------------------------------- */

    if (subCategorySlug) {
        const slugs = subCategorySlug
            .split(",")
            .map((item) =>
                decodeURIComponent(item)
                    .toLowerCase()
                    .trim()
            )
            .filter(Boolean);

        const subCategories =
            await SubCategory.find({
                $or: [
                    {
                        slug: {
                            $in: slugs,
                        },
                    },
                    {
                        hiSlug: {
                            $in: slugs,
                        },
                    },
                ],
            }).select("_id");

        filter.subCategory = {
            $in: subCategories.map(
                (item) => item._id
            ),
        };
    }

    /* -----------------------------------------
       Tags
    ----------------------------------------- */

    if (tags) {
        const tagIds = parseObjectIds(tags);

        if (tagIds.length) {
            filter.tags = {
                $in: tagIds,
            };
        }
    }

    /* -----------------------------------------
       Boolean filters
    ----------------------------------------- */

    const breakingValue =
        parseBoolean(isBreaking);

    const featuredValue =
        parseBoolean(isFeatured);

    const trendingValue =
        parseBoolean(isTrending);

    if (breakingValue !== undefined) {
        filter.isBreaking = breakingValue;
    }

    if (featuredValue !== undefined) {
        filter.isFeatured = featuredValue;
    }

    if (trendingValue !== undefined) {
        filter.isTrending = trendingValue;
    }

    /* -----------------------------------------
       Has featured image
    ----------------------------------------- */

    const imageValue =
        parseBoolean(hasImage);

    if (imageValue === true) {
        filter.featuredImage = {
            $nin: [null, ""],
        };
    }

    if (imageValue === false) {
        filter.$and = [
            ...(filter.$and || []),
            {
                $or: [
                    { featuredImage: null },
                    { featuredImage: "" },
                    {
                        featuredImage: {
                            $exists: false,
                        },
                    },
                ],
            },
        ];
    }

    /* -----------------------------------------
       Has video
    ----------------------------------------- */

    const videoValue =
        parseBoolean(hasVideo);

    if (videoValue === true) {
        filter["videos.0"] = {
            $exists: true,
        };
    }

    if (videoValue === false) {
        filter["videos.0"] = {
            $exists: false,
        };
    }

    /* -----------------------------------------
       Views range
    ----------------------------------------- */

    if (
        minViews !== undefined ||
        maxViews !== undefined
    ) {
        filter.views = {};

        if (minViews !== undefined) {
            filter.views.$gte =
                Number(minViews);
        }

        if (maxViews !== undefined) {
            filter.views.$lte =
                Number(maxViews);
        }
    }

    /* -----------------------------------------
       Likes range
    ----------------------------------------- */

    if (
        minLikes !== undefined ||
        maxLikes !== undefined
    ) {
        filter.likes = {};

        if (minLikes !== undefined) {
            filter.likes.$gte =
                Number(minLikes);
        }

        if (maxLikes !== undefined) {
            filter.likes.$lte =
                Number(maxLikes);
        }
    }

    /* -----------------------------------------
       Read time range
    ----------------------------------------- */

    if (
        minReadTime !== undefined ||
        maxReadTime !== undefined
    ) {
        filter.readTime = {};

        if (minReadTime !== undefined) {
            filter.readTime.$gte =
                Number(minReadTime);
        }

        if (maxReadTime !== undefined) {
            filter.readTime.$lte =
                Number(maxReadTime);
        }
    }

    /* -----------------------------------------
       Published date
    ----------------------------------------- */

    if (publishedFrom || publishedTo) {
        filter.publishedAt = {};

        if (publishedFrom) {
            filter.publishedAt.$gte =
                new Date(publishedFrom);
        }

        if (publishedTo) {
            const endDate =
                new Date(publishedTo);

            endDate.setHours(
                23,
                59,
                59,
                999
            );

            filter.publishedAt.$lte =
                endDate;
        }
    }

    /* -----------------------------------------
       Scheduled date
    ----------------------------------------- */

    if (scheduledFrom || scheduledTo) {
        filter.scheduledAt = {};

        if (scheduledFrom) {
            filter.scheduledAt.$gte =
                new Date(scheduledFrom);
        }

        if (scheduledTo) {
            const endDate =
                new Date(scheduledTo);

            endDate.setHours(
                23,
                59,
                59,
                999
            );

            filter.scheduledAt.$lte =
                endDate;
        }
    }

    /* -----------------------------------------
       Created date
    ----------------------------------------- */

    if (createdFrom || createdTo) {
        filter.createdAt = {};

        if (createdFrom) {
            filter.createdAt.$gte =
                new Date(createdFrom);
        }

        if (createdTo) {
            const endDate =
                new Date(createdTo);

            endDate.setHours(
                23,
                59,
                59,
                999
            );

            filter.createdAt.$lte =
                endDate;
        }
    }

    return filter;
};

export const createNews = async (req, res) => {
    try {
        const {
            title,
            hiTitle,
            slug,
            hiSlug,
            content,
            hiContent,
            category,
            subCategory,
            status,
        } = req.body;

        if (
            !title ||
            !hiTitle ||
            !slug ||
            !content ||
            !hiContent ||
            !category
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "title, hiTitle, slug, content, hiContent and category are required",
            });
        }

        /* -----------------------------------------
           Validate category
        ----------------------------------------- */

        if (
            !mongoose.Types.ObjectId.isValid(
                category
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID",
            });
        }

        const categoryExists =
            await Category.findById(category);

        if (!categoryExists) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        /* -----------------------------------------
           Validate sub category
        ----------------------------------------- */

        if (subCategory) {
            if (
                !mongoose.Types.ObjectId.isValid(
                    subCategory
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid subCategory ID",
                });
            }

            const subCategoryExists =
                await SubCategory.findOne({
                    _id: subCategory,
                    category,
                });

            if (!subCategoryExists) {
                return res.status(400).json({
                    success: false,
                    message:
                        "SubCategory does not belong to the selected category",
                });
            }
        }

        /* -----------------------------------------
           Check slug
        ----------------------------------------- */

        const normalizedSlug = slug
            .toLowerCase()
            .trim();

        const existing =
            await News.findOne({
                slug: normalizedSlug,
            }).select("_id");

        if (existing) {
            return res.status(409).json({
                success: false,
                message:
                    "News with this slug already exists",
            });
        }

        /* -----------------------------------------
           Handle publication
        ----------------------------------------- */

        const payload = {
            ...req.body,

            title: title.trim(),

            hiTitle: hiTitle.trim(),

            slug: normalizedSlug,

            hiSlug: hiSlug
                ? hiSlug.toLowerCase().trim()
                : undefined,
        };

        if (
            status === "published" &&
            !payload.publishedAt
        ) {
            payload.publishedAt =
                new Date();
        }

        const news =
            await News.create(payload);

        await news.populate(newsPopulate);

        return res.status(201).json({
            success: true,
            message:
                "News created successfully",
            data: news,
        });
    } catch (error) {
        console.error(
            "Create News Error:",
            error
        );

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "News slug already exists",
            });
        }

        return res.status(500).json({
            success: false,
            message:
                "Failed to create news",
            error: error.message,
        });
    }
};

export const getAllNews = async (
    req,
    res
) => {
    try {
        const { page, limit, skip } =
            getPagination(req.query);

        let {
            sortBy = "createdAt",
            sortOrder = "desc",
        } = req.query;

        const filter =
            await buildNewsFilter(
                req.query,
                false
            );

        const allowedSortFields = [
            "title",
            "hiTitle",
            "createdAt",
            "updatedAt",
            "publishedAt",
            "scheduledAt",
            "views",
            "likes",
            "readTime",
            "status",
        ];

        if (
            !allowedSortFields.includes(
                sortBy
            )
        ) {
            sortBy = "createdAt";
        }

        const direction =
            sortOrder === "asc" ||
                sortOrder === "1"
                ? 1
                : -1;

        const sort = {
            [sortBy]: direction,
            _id: direction,
        };

        const [
            news,
            total,
        ] = await Promise.all([
            News.find(filter)
                .populate(newsPopulate)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),

            News.countDocuments(filter),
        ]);

        const totalPages =
            Math.ceil(total / limit);

        return res.status(200).json({
            success: true,

            data: news,

            pagination: {
                total,
                page,
                limit,
                totalPages,

                hasNextPage:
                    page < totalPages,

                hasPrevPage:
                    page > 1,

                nextPage:
                    page < totalPages
                        ? page + 1
                        : null,

                prevPage:
                    page > 1
                        ? page - 1
                        : null,
            },
        });
    } catch (error) {
        console.error(
            "Get News Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch news",
            error: error.message,
        });
    }
};

export const getPublishedNews = async (
    req,
    res
) => {
    try {
        const { page, limit, skip } =
            getPagination(req.query);

        let {
            sortBy = "publishedAt",
            sortOrder = "desc",
        } = req.query;

        const filter =
            await buildNewsFilter(
                req.query,
                true
            );

        const allowedSortFields = [
            "publishedAt",
            "createdAt",
            "views",
            "likes",
            "readTime",
            "title",
        ];

        if (
            !allowedSortFields.includes(
                sortBy
            )
        ) {
            sortBy = "publishedAt";
        }

        const direction =
            sortOrder === "asc" ? 1 : -1;

        const [news, total] =
            await Promise.all([
                News.find(filter)
                    .populate(newsPopulate)
                    .sort({
                        [sortBy]: direction,
                        _id: -1,
                    })
                    .skip(skip)
                    .limit(limit)
                    .lean(),

                News.countDocuments(filter),
            ]);

        const totalPages =
            Math.ceil(total / limit);

        return res.status(200).json({
            success: true,

            data: news,

            pagination: {
                total,
                page,
                limit,
                totalPages,

                hasNextPage:
                    page < totalPages,

                hasPrevPage:
                    page > 1,

                nextPage:
                    page < totalPages
                        ? page + 1
                        : null,

                prevPage:
                    page > 1
                        ? page - 1
                        : null,
            },
        });
    } catch (error) {
        console.error(
            "Published News Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch published news",
            error: error.message,
        });
    }
};

export const getNewsById = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(
                id
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid news ID",
            });
        }

        const news =
            await News.findById(id)
                .populate(newsPopulate)
                .lean();

        if (!news) {
            return res.status(404).json({
                success: false,
                message: "News not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: news,
        });
    } catch (error) {
        console.error(
            "Get News ID Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch news",
            error: error.message,
        });
    }
};

export const getNewsBySlug = async (
    req,
    res
) => {
    try {
        const { slug } = req.params;

        const normalizedSlug =
            decodeURIComponent(slug)
                .toLowerCase()
                .trim();

        const news =
            await News.findOne({
                $or: [
                    {
                        slug: normalizedSlug,
                    },
                    {
                        hiSlug:
                            normalizedSlug,
                    },
                ],
            })
                .populate(newsPopulate)
                .lean();

        if (!news) {
            return res.status(404).json({
                success: false,
                message: "News not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: news,
        });
    } catch (error) {
        console.error(
            "Get News Slug Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch news",
            error: error.message,
        });
    }
};

export const getPublishedNewsBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const normalizedSlug =
            decodeURIComponent(slug)
                .toLowerCase()
                .trim();

        const news =
            await News.findOne({
                status: "published",

                $and: [
                    {
                        $or: [
                            {
                                slug:
                                    normalizedSlug,
                            },
                            {
                                hiSlug:
                                    normalizedSlug,
                            },
                        ],
                    },

                    {
                        $or: [
                            {
                                publishedAt: {
                                    $lte: new Date(),
                                },
                            },
                            {
                                publishedAt: null,
                            },
                        ],
                    },
                ],
            })
                .populate(newsPopulate)
                .lean();

        if (!news) {
            return res
                .status(404)
                .json({
                    success: false,
                    message:
                        "Published news not found",
                });
        }

        return res.status(200).json({
            success: true,
            data: news,
        });
    } catch (error) {
        console.error(
            "Published News Slug Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch news",
            error: error.message,
        });
    }
};

export const updateNews = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(
                id
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid news ID",
            });
        }

        const news =
            await News.findById(id);

        if (!news) {
            return res.status(404).json({
                success: false,
                message: "News not found",
            });
        }

        const {
            slug,
            hiSlug,
            category,
            subCategory,
            status,
        } = req.body;

        /* -----------------------------------------
           Category validation
        ----------------------------------------- */

        const finalCategory =
            category || news.category;

        if (
            !mongoose.Types.ObjectId.isValid(
                finalCategory
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid category ID",
            });
        }

        const categoryExists =
            await Category.findById(
                finalCategory
            );

        if (!categoryExists) {
            return res.status(404).json({
                success: false,
                message:
                    "Category not found",
            });
        }

        /* -----------------------------------------
           SubCategory validation
        ----------------------------------------- */

        const finalSubCategory =
            subCategory !== undefined
                ? subCategory
                : news.subCategory;

        if (finalSubCategory) {
            if (
                !mongoose.Types.ObjectId.isValid(
                    finalSubCategory
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid subCategory ID",
                });
            }

            const validSubCategory =
                await SubCategory.findOne({
                    _id: finalSubCategory,
                    category: finalCategory,
                });

            if (!validSubCategory) {
                return res.status(400).json({
                    success: false,
                    message:
                        "SubCategory does not belong to selected category",
                });
            }
        }

        /* -----------------------------------------
           Slug duplicate
        ----------------------------------------- */

        if (slug) {
            const normalizedSlug = slug
                .toLowerCase()
                .trim();

            const duplicate =
                await News.findOne({
                    _id: {
                        $ne: id,
                    },

                    slug: normalizedSlug,
                });

            if (duplicate) {
                return res.status(409).json({
                    success: false,
                    message:
                        "News with this slug already exists",
                });
            }

            req.body.slug =
                normalizedSlug;
        }

        if (hiSlug) {
            req.body.hiSlug = hiSlug
                .toLowerCase()
                .trim();
        }

        /* -----------------------------------------
           Auto publishedAt
        ----------------------------------------- */

        if (
            status === "published" &&
            news.status !== "published" &&
            !req.body.publishedAt
        ) {
            req.body.publishedAt =
                new Date();
        }

        Object.keys(req.body).forEach(
            (key) => {
                news[key] = req.body[key];
            }
        );

        await news.save();

        await news.populate(newsPopulate);

        return res.status(200).json({
            success: true,
            message:
                "News updated successfully",
            data: news,
        });
    } catch (error) {
        console.error(
            "Update News Error:",
            error
        );

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "News slug already exists",
            });
        }

        return res.status(500).json({
            success: false,
            message:
                "Failed to update news",
            error: error.message,
        });
    }
};

export const deleteNews = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(
                id
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid news ID",
            });
        }

        const news =
            await News.findByIdAndDelete(id);

        if (!news) {
            return res.status(404).json({
                success: false,
                message: "News not found",
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "News deleted successfully",
            data: news,
        });
    } catch (error) {
        console.error(
            "Delete News Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to delete news",
            error: error.message,
        });
    }
};

export const updateNewsStatus = async (
    req,
    res
) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "draft",
            "published",
            "archived",
            "pending",
        ];

        if (
            !allowedStatuses.includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid news status",
            });
        }

        if (
            !mongoose.Types.ObjectId.isValid(
                id
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid news ID",
            });
        }

        const update = {
            status,
        };

        if (status === "published") {
            const existing =
                await News.findById(id).select(
                    "publishedAt"
                );

            if (!existing) {
                return res.status(404).json({
                    success: false,
                    message:
                        "News not found",
                });
            }

            if (!existing.publishedAt) {
                update.publishedAt =
                    new Date();
            }
        }

        const news =
            await News.findByIdAndUpdate(
                id,
                update,
                {
                    new: true,
                    runValidators: true,
                }
            ).populate(newsPopulate);

        if (!news) {
            return res.status(404).json({
                success: false,
                message: "News not found",
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "News status updated successfully",
            data: news,
        });
    } catch (error) {
        console.error(
            "Update Status Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to update status",
            error: error.message,
        });
    }
};

export const toggleBreaking = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(
                id
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid news ID",
            });
        }

        const news =
            await News.findById(id);

        if (!news) {
            return res.status(404).json({
                success: false,
                message: "News not found",
            });
        }

        news.isBreaking =
            !news.isBreaking;

        await news.save();

        return res.status(200).json({
            success: true,
            message: `Breaking status ${news.isBreaking
                ? "enabled"
                : "disabled"
                }`,
            data: news,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message:
                "Failed to update breaking status",
            error: error.message,
        });
    }
};

export const toggleFeatured = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(
                id
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid news ID",
            });
        }

        const news =
            await News.findById(id);

        if (!news) {
            return res.status(404).json({
                success: false,
                message: "News not found",
            });
        }

        news.isFeatured =
            !news.isFeatured;

        await news.save();

        return res.status(200).json({
            success: true,
            message: `Featured status ${news.isFeatured
                ? "enabled"
                : "disabled"
                }`,
            data: news,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message:
                "Failed to update featured status",
            error: error.message,
        });
    }
};

export const toggleTrending = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(
                id
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid news ID",
            });
        }

        const news =
            await News.findById(id);

        if (!news) {
            return res.status(404).json({
                success: false,
                message: "News not found",
            });
        }

        news.isTrending =
            !news.isTrending;

        await news.save();

        return res.status(200).json({
            success: true,
            message: `Trending status ${news.isTrending
                ? "enabled"
                : "disabled"
                }`,
            data: news,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message:
                "Failed to update trending status",
            error: error.message,
        });
    }
};

export const incrementViews = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(
                id
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid news ID",
            });
        }

        const news =
            await News.findByIdAndUpdate(
                id,
                {
                    $inc: {
                        views: 1,
                    },
                },
                {
                    new: true,
                }
            ).select("_id views");

        if (!news) {
            return res.status(404).json({
                success: false,
                message: "News not found",
            });
        }

        return res.status(200).json({
            success: true,
            views: news.views,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message:
                "Failed to increment views",
            error: error.message,
        });
    }
};

export const incrementLike = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(
                id
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid news ID",
            });
        }

        const news =
            await News.findByIdAndUpdate(
                id,
                {
                    $inc: {
                        likes: 1,
                    },
                },
                {
                    new: true,
                }
            ).select("_id likes");

        if (!news) {
            return res.status(404).json({
                success: false,
                message: "News not found",
            });
        }

        return res.status(200).json({
            success: true,
            likes: news.likes,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message:
                "Failed to increment likes",
            error: error.message,
        });
    }
};

export const getRelatedNews = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        const limit = Math.min(
            parseInt(req.query.limit) || 6,
            20
        );

        if (
            !mongoose.Types.ObjectId.isValid(
                id
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid news ID",
            });
        }

        const currentNews =
            await News.findById(id).select(
                "category subCategory tags"
            );

        if (!currentNews) {
            return res.status(404).json({
                success: false,
                message: "News not found",
            });
        }

        const relatedConditions = [
            {
                category:
                    currentNews.category,
            },
        ];

        if (currentNews.subCategory) {
            relatedConditions.push({
                subCategory:
                    currentNews.subCategory,
            });
        }

        if (currentNews.tags?.length) {
            relatedConditions.push({
                tags: {
                    $in: currentNews.tags,
                },
            });
        }

        const relatedNews =
            await News.find({
                _id: {
                    $ne: id,
                },

                status: "published",

                publishedAt: {
                    $lte: new Date(),
                },

                $or: relatedConditions,
            })
                .select(
                    "title hiTitle slug hiSlug summary hiSummary featuredImage category subCategory publishedAt views readTime"
                )
                .populate(
                    "category",
                    "name hiName slug hiSlug"
                )
                .populate(
                    "subCategory",
                    "name hiName slug hiSlug"
                )
                .sort({
                    publishedAt: -1,
                })
                .limit(limit)
                .lean();

        return res.status(200).json({
            success: true,
            data: relatedNews,
        });
    } catch (error) {
        console.error(
            "Related News Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch related news",
            error: error.message,
        });
    }
};