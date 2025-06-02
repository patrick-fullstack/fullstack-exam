import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

// Define user roles
export enum UserRole {
  SUPER_ADMIN = "super_admin",
  MANAGER = "manager",
  EMPLOYEE = "employee",
}

// User interface
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId; // MongoDB ObjectId - unique identifier
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  companyId?: mongoose.Types.ObjectId; // Optional for super admin
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  // method to compare password - for login
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// User schema
// This  defines the structure of the User document in MongoDB
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: [true, "Role is required"],
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: function (this: IUser) {
        // Required for managers and employees, optional for super admin
        return this.role !== UserRole.SUPER_ADMIN;
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  // Only hash if password is modified
  if (!this.isModified("password")) return next();

  try {
    // Hash password with salt rounds of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create and export the model - this will create a collection named 'users' in MongoDB
export const User = mongoose.model<IUser>("User", userSchema);
