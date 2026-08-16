import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  hiTitle: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  type: {
    type: String,
    default: "article"
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  hiSlug: {
    type: String,
    lowercase: true,
    trim: true
  },
  summary: {
    type: String
  },
  hiSummary: {
    type: String,
    maxlength: 500
  },
  content: {
    type: String,
    required: true
  },
  hiContent: {
    type: String,
    required: true
  },
  featuredImage: {
    type: String
  },
  images: [{
    url: String,
    caption: String,
    alt: String
  }],
  videos: [{
    url: String,
    caption: String,
    platform: {
      type: String,
      enum: ['youtube', 'vimeo', 'self-hosted', "url"]
    }
  }],
  author: {
    type:String,
    default:"admin"
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubCategory',
    default: null
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'pending'],
    default: 'draft'
  },
  isBreaking: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isTrending: {
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
  publishedAt: {
    type: Date,
    default: null
  },
  scheduledAt: {
    type: Date,
    default: null
  },
  readTime: {
    type: Number,
    default: 0
  },
  source: {
    name: String,
    url: String
  },
  metaTitle: {
    type: String,
    maxlength: 200
  },
  metaDescription: {
    type: String,
    maxlength: 500
  },
  metaKeywords: String,
  hiMetaTitle: {
    type: String,
    maxlength: 200
  },
  hiMetaDescription: {
    type: String,
    maxlength: 500
  },
  hiMetaKeywords:String
}, {
  timestamps: true
});

newsSchema.index({ slug: 1 });

const News = mongoose.model('News', newsSchema);
export default News;
