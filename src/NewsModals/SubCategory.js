import mongoose from 'mongoose';

const subCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  slug: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: 500
  },
    hiName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  hiSlug: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  hiDscription: {
    type: String,
    maxlength: 500
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


subCategorySchema.index({ category: 1, slug: 1 }, { unique: true });

const SubCategory = mongoose.model('SubCategory', subCategorySchema);
export default SubCategory;
