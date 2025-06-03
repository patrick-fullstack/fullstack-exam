import mongoose, { Document, Schema } from "mongoose";

// Company interface
export interface ICompany extends Document {
  _id: mongoose.Types.ObjectId; // unique identifier
  name: string;
  email: string;
  logo?: string;
  website: string;
  createdAt: Date;
  updatedAt: Date;
}

// Company schema
const companySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Company email is required"],
      unique: true,
      validate: {
        validator: function (email: string) {
          // Only validate if email is provided
          if (!email) return true;
          return /\S+@\S+\.\S+/.test(email);
        },
        message: "Please provide a valid email address",
      },
    },
    logo: {
      type: String,
      default: null,
    },
    website: {
      type: String,
      required: [true, "Company website is required"],
      validate: {
        validator: function (url: string) {
          // Only validate if URL is provided
          if (!url) return true;
          return /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w- .\/?%&=]*)?$/.test(
            url
          );
        },
        message: "Please provide a valid website URL",
      },
    },
  },
  {
    timestamps: true,
    collection: "companies",
  }
);

companySchema.index({ name: 1 });
companySchema.index({ email: 1 });

export const Company = mongoose.model<ICompany>("Company", companySchema);
