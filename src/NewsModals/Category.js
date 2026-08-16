import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true, maxlength: 100 },
  hiName:{type:String},
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  hiSlug:{ type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, maxlength: 500 },
  hiDescription: { type: String, maxlength: 500 },
  icon: { type: String },
  color: { type: String },
  isNavbar: { type: Boolean, default: false },
  hasDropdown: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const Category = mongoose.model('Category', categorySchema);
export default Category;
