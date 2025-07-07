import mongoose, { Document, Schema } from "mongoose";

// Session interface
export interface ISession extends Document {
  _id: string; 
  data: any;
  expires: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Session schema
const sessionSchema = new Schema<ISession>(
  {
    _id: {
      type: String,
      required: true,
    },
    data: {
      type: Schema.Types.Mixed, 
      required: true,
    },
    expires: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, 
    },
  },
  {
    timestamps: true, 
    collection: "sessions",
  }
);


export const Session = mongoose.model<ISession>("Session", sessionSchema);
