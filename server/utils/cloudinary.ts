import cloudinary from "../config/cloudinary";

export const uploadToCloudinary = async (
  buffer: Buffer,
  folder: string = "mini-crm",
  options: any = {}
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Simple size mapping - company logos minimum 100x100
    const sizes = {
      "user-avatars": { width: 300, height: 300 },
      "company-logos": { width: 100, height: 100 },
    };

    // Get size or use default
    const size = sizes[folder as keyof typeof sizes] || {
      width: 300,
      height: 300,
    };

    cloudinary.uploader
      .upload_stream(
        {
          folder,
          transformation: [{ ...size, crop: "fill" }, { quality: "auto" }],
          ...options,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result?.secure_url || "");
        }
      )
      .end(buffer);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};
