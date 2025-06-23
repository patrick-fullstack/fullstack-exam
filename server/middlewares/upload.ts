import multer from "multer";
import { Request, Response, NextFunction } from "express";
import sizeOf from "image-size";

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
  res: Response,
  folder: string = "mini-crm"
): boolean => {
  if (file.size > 2 * 1024 * 1024) {
    res.status(400).json({
      success: false,
      message: "File size must be less than 2MB",
    });
    return false;
  }
  try {
    // Get image dimensions
    const dimensions = sizeOf(file.buffer);

    if (!dimensions.width || !dimensions.height) {
      res.status(400).json({
        success: false,
        message: "Could not determine image dimensions",
      });
      return false;
    }

    // Check minimum dimensions based on folder
    if (
      folder === "user-avatars" &&
      (dimensions.width < 50 || dimensions.height < 50)
    ) {
      res.status(400).json({
        success: false,
        message: "Avatar images must be at least 50x50 pixels",
      });
      return false;
    }

    if (
      folder === "company-logos" &&
      (dimensions.width < 100 || dimensions.height < 100)
    ) {
      res.status(400).json({
        success: false,
        message: "Company logos must be at least 100x100 pixels",
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error validating image dimensions:", error);
    res.status(400).json({
      success: false,
      message: "Invalid image format or corrupted image file",
    });
    return false;
  }
};
