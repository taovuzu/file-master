import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: function () {
        return !this.loginType || this.loginType.includes("EMAIL_PASSWORD");
      }
    },
    plan: {
      type: String,
      enum: ['FREE', 'PRO', 'BUSINESS'],
      default: 'FREE'
    },
    subscription: {
      status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE', 'CANCELLED', 'EXPIRED'],
        default: 'INACTIVE'
      },
      plan: {
        type: String,
        enum: ['FREE', 'PRO', 'BUSINESS'],
        default: 'FREE'
      },
      startDate: Date,
      endDate: Date,
      razorpaySubscriptionId: String,
      razorpayCustomerId: String,
      autoRenew: {
        type: Boolean,
        default: false
      }
    },
    usage: {
      lastResetAt: { type: Date, default: () => new Date() },
      dailyOperations: { type: Number, default: 0 },
      monthlyOperations: { type: Number, default: 0 },
      totalOperations: { type: Number, default: 0 },
      totalFilesProcessed: { type: Number, default: 0 },
      totalDataProcessed: { type: Number, default: 0 } // in MB
    },
    profile: {
      phone: String,
      company: String,
      jobTitle: String,
      country: String,
      timezone: String,
      avatar: String,
      bio: String
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'light'
      },
      language: {
        type: String,
        default: 'en'
      },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: false },
        processing: { type: Boolean, default: true },
        marketing: { type: Boolean, default: false }
      },
      privacy: {
        profileVisible: { type: Boolean, default: false },
        historyVisible: { type: Boolean, default: false },
        analyticsEnabled: { type: Boolean, default: true }
      }
    },
    loginType: {
      type: [String],
      enum: ["GOOGLE", "FACEBOOK", "EMAIL_PASSWORD"],
      default: ["EMAIL_PASSWORD"]
    },
    googleId: {
      type: String,
      sparse: true
    },
    refreshToken: {
      type: String
    },
    forgetPasswordToken: {
      type: String
    },
    forgetPasswordExpiry: {
      type: Date
    },
    lastLoginAt: Date,
    isEmailVerified: {
      type: Boolean,
      default: false
    }
  }, { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullName: this.fullName,
      plan: this.plan,
      subscription: {
        status: this.subscription?.status || 'INACTIVE',
        plan: this.subscription?.plan || this.plan || 'FREE',
        endDate: this.subscription?.endDate || null
      }
      
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id

    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  );
};

userSchema.methods.generateTemporaryToken = function () {
  const unHashedToken = crypto.randomBytes(20).toString("hex");
  const hashedToken = crypto.
  createHash("sha256").
  update(unHashedToken).
  digest("hex");
  const tokenExpiry = new Date(Date.now() + Number(process.env.USER_PASSWORD_EXPIRY));

  return { unHashedToken, hashedToken, tokenExpiry };
};
// check git status
export const User = mongoose.model("User", userSchema); 
