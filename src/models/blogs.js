import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    excerpt: {
        type: String
    },
    content: {
        type: String,
        required: true
    },
    featuredImage: {
        type: String
    },
    image: [{
        url: String,
        caption: String,
        alt: String
    }],
    author: {
        type: String,
        default: "admin"
    },
    category: {
        type: String,
        default: "web"
    },
    tags: [{
        type: String
    }],
    status: {
        type: String,
        enum: ['draft', 'published', 'archived', 'pending'],
        default: 'draft'
    },
    featured: {
        type: Boolean,
        default: false
    },
    views: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    },
    readTime: {
        type: Number,
        default: 0
    },
    metaTitle: {
        type: String,
        maxlength: 200
    },
    metaDescription: {
        type: String,
        maxlength: 500
    },
    metaKeywords: [String]
}, {
    timestamps: true
});

const blogCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        maxlength: 200
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    excerpt: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes
newsSchema.index({ slug: 1 });

blogCategorySchema.index({ slug: 1 });

const Blog = mongoose.model('Blog', newsSchema);
const BlogCategory = mongoose.model('BlogCategory', blogCategorySchema);

export { Blog, BlogCategory };