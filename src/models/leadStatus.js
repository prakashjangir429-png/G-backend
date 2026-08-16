import mongoose, { Schema } from "mongoose";

const leadStatusSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    order: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

leadStatusSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  try {
    const lastStatus = await mongoose
      .model("LeadStatus")
      .findOne()
      .sort({ order: -1 })
      .select("order");

    this.order = lastStatus ? lastStatus.order + 1 : 1;

    next();
  } catch (error) {
    next(error);
  }
});

export const LeadStatus = mongoose.model("LeadStatus", leadStatusSchema);