import mongoose from "mongoose";

const leadAssignmentSchema = new mongoose.Schema(
  {
    formId: {
      type: String,
      required: true,
      index: true
    },

    campaignId: {
      type: String,
      trim: true,
      index: true
    },

    // 🔥 Replace counselors with teamId
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true
    },

    lastAssignedIndex: {
      type: Number,
      default: -1
    },

    isActive: {
      type: Boolean,
      default: true
    },

    assignmentType: {
      type: String,
      enum: ["round_robin", "random", "manual"],
      default: "round_robin"
    },

    totalAssigned: {
      type: Number,
      default: 0
    },

    lastAssignedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// prevent duplicate formId
leadAssignmentSchema.index({ formId: 1 }, { unique: true });

export default mongoose.model("LeadAssignmentConfig", leadAssignmentSchema);