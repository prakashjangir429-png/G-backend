import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
      trim: true
    },
    website: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true
        },
        joinedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);

// Indexes
teamSchema.index({ name: 1 });

teamSchema.pre("save", function (next) {
  const uniqueMembers = new Set(
    this.members.map(m => m.user.toString())
  );

  if (uniqueMembers.size !== this.members.length) {
    return next(new Error("Duplicate members in team"));
  }

  next();
});

export default mongoose.model("Team", teamSchema);