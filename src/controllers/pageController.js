import WebsiteContent from "../models/page.js";
import slugify from "slugify";

// CREATE PAGE
export const createWebsiteContent = async (req, res) => {
    try {
        const body = req.body;

        if (!body.name) {
            return res.status(400).json({
                success: false,
                message: "Name is required",
            });
        }

        const slug =
            body.slug ||
            slugify(body.name, {
                lower: true,
                strict: true,
            });

        const existing = await WebsiteContent.findOne({ slug });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Slug already exists",
            });
        }

        const content = await WebsiteContent.create({
            ...body,
            slug,
        });

        return res.status(201).json({
            success: true,
            message: "Website content created successfully",
            data: content,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// GET ALL
export const getAllWebsiteContents = async (req, res) => {
    try {
        const {
            search,
            page = 1,
            limit = 10,
            status,
            pageType,
            featured,
        } = req.query;

        const query = {};

        if (search) {
            query.$or = [
                {
                    name: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    title: {
                        $regex: search,
                        $options: "i",
                    },
                },
            ];
        }

        if (status) {
            query.status = status;
        }

        if (pageType) {
            query.pageType = pageType;
        }

        if (featured) {
            query.isFeatured = featured === "true";
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [data, total] = await Promise.all([
            WebsiteContent.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),

            WebsiteContent.countDocuments(query),
        ]);

        return res.status(200).json({
            success: true,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit),
            data,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// GET SINGLE BY ID
export const getWebsiteContentById = async (req, res) => {
    try {
        const content = await WebsiteContent.findById(req.params.id);

        if (!content) {
            return res.status(404).json({
                success: false,
                message: "Content not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: content,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// GET SINGLE BY SLUG
export const getWebsiteContentBySlug = async (req, res) => {
    try {
        const content = await WebsiteContent.findOne({
            slug: req.params.slug,
            status: "published",
        });

        if (!content) {
            return res.status(404).json({
                success: false,
                message: "Content not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: content,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// UPDATE
export const updateWebsiteContent = async (req, res) => {
    try {
        const body = req.body;

        if (body.slug) {
            const existing = await WebsiteContent.findOne({
                slug: body.slug,
                _id: { $ne: req.params.id },
            });

            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: "Slug already exists",
                });
            }
        }

        const updated = await WebsiteContent.findByIdAndUpdate(
            req.params.id,
            body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Content not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Content updated successfully",
            data: updated,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// DELETE
export const deleteWebsiteContent = async (req, res) => {
    try {
        const deleted = await WebsiteContent.findByIdAndDelete(
            req.params.id
        );

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Content not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Content deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// GET NAVBAR ITEMS
export const getNavbarItems = async (req, res) => {
    try {
        const data = await WebsiteContent.find({
            isNavbar: true,
            status: "published",
        }).select("name navbarTitle slug");

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// GET FOOTER ITEMS
export const getFooterItems = async (req, res) => {
    try {
        const data = await WebsiteContent.find({
            isFooter: true,
            status: "published",
        }).select("name slug");

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};