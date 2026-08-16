import mongoose from 'mongoose';
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user','admin', 'super_admin', 'editor', "manager", "counselor", "leader"],
    default: 'user'
  },
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  password:{
    type: String,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true,
  },
  profile: {
    dateOfBirth: Date,
    bio: String,
    gender: String
  },
  city:{
    type: String,
    trim: true
  },
  profilePic: {
    type: String
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  refreshTokens: [String]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });


userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  if (this.password && this.password.length < 8) {
    return next(new Error("Password must be at least 8 characters"));
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);