import mongoose from "mongoose";

const websiteContentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
        },
        slug: {
            type: String,
            trim: true,
            unique: true,
            index: true
        },
        pageType: {
            type: String,
            trim: true,
        },
        title: {
            type: String,
            trim: true,
        },
        subTitle: { type: String, trim: true },
        isNavbar: { type: Boolean, default: false },
        navbarTitle: { type: String, trim: true },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        isFooter: {
            type: Boolean,
            default: false,
        },
        seo: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        sections: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        extraDetails: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        status: {
            type: String,
            enum: ["draft", "published"],
            default: "draft",
        }
    },
    {
        timestamps: true,
    }
);

websiteContentSchema.index({ slug: 1 });

export default mongoose.model(
    "WebsiteContent",
    websiteContentSchema
);