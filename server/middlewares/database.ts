import { Request, Response, NextFunction } from "express";
import connectDB from "../config/database";

export const ensureDatabase = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await connectDB();
  next();
};
