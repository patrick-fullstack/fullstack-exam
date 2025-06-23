import cloudinary from "../config/cloudinary";

export interface ImageFormats {
  original: string;
  thumbnail: string;
  small: string;
  medium: string;
}

export const uploadToCloudinary = async (
  buffer: Buffer,
  folder: string = "mini-crm",
  options: any = {}
): Promise<ImageFormats> => {
  return new Promise((resolve, reject) => {
    const sizes = {
      "user-avatars": {
        thumbnail: { width: 50, height: 50, crop: "fill" },
        small: { width: 100, height: 100, crop: "fill" },
        medium: { width: 200, height: 200, crop: "fill" },
      },
      "company-logos": {
        thumbnail: { width: 100, height: 100, crop: "fill" },
        small: { width: 200, height: 200, crop: "fill" },
        medium: { width: 300, height: 300, crop: "fill" },
      },
    };

    const size = sizes[folder as keyof typeof sizes] || {
      thumbnail: { width: 100, height: 100, crop: "fill" },
      small: { width: 200, height: 200, crop: "fill" },
      medium: { width: 300, height: 300, crop: "fill" },
    };

    cloudinary.uploader
      .upload_stream(
        {
          folder,
          ...options,
        },
        (error, result) => {
          if (error) reject(error);
          else if (!result) {
            reject(new Error("Failed to upload image"));
          } else {
            const publicId = result.public_id;

            const urls: ImageFormats = {
              original: result.secure_url,
              thumbnail: cloudinary.url(publicId, {
                transformation: [
                  { ...size.thumbnail, crop: "fill" },
                  { quality: "auto" },
                ],
              }),
              small: cloudinary.url(publicId, {
                transformation: [
                  { ...size.small, crop: "fill" },
                  { quality: "auto" },
                ],
              }),
              medium: cloudinary.url(publicId, {
                transformation: [
                  { ...size.medium, crop: "fill" },
                  { quality: "auto" },
                ],
              }),
            };
            resolve(urls);
          }
        }
      )
      .end(buffer);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};
