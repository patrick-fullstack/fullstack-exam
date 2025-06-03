import multer from "multer";
import { Request, Response, NextFunction } from "express";

// stores uploaded files in memory (RAM) as buffer objects
const storage = multer.memoryStorage();

// fileFilter function to restrict file types
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
});

// File validation middleware
export const validateFileUpload = (
  file: Express.Multer.File,
  res: Response
): boolean => {
  if (file.size > 2 * 1024 * 1024) {
    res.status(400).json({
      success: false,
      message: "File size must be less than 2MB",
    });
    return false;
  }
  return true;
};
