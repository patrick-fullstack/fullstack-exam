import type { ImageFormats, ImageFormat } from "../types/image-format";

// Get image URL from ImageFormats object with fallback chain
export const getImageUrl = (
  images: ImageFormats | string | undefined | null,
  preferredSize: ImageFormat = "small"
): string | null => {
  if (!images) return null;

  // Handle legacy string format
  if (typeof images === "string") {
    return images;
  }

  // Handle ImageFormats object with fallback chain
  return (
    images[preferredSize] ||
    images.small ||
    images.thumbnail ||
    images.medium ||
    images.original ||
    null
  );
};

// Check if image exists in any format
export const hasImage = (
  images: ImageFormats | string | undefined | null
): boolean => {
  return getImageUrl(images) !== null;
};

// Get appropriate size based on context
export const getContextualSize = (
  context:
    | "header"
    | "dashboard"
    | "profile"
    | "card"
    | "detail"
    | "notification"
): ImageFormat => {
  const sizeMap: Record<string, ImageFormat> = {
    header: "thumbnail", // 50x50 - small header avatars
    dashboard: "thumbnail", // 50x50 - dashboard display
    profile: "medium", // 200x200 - profile pages
    card: "small", // 100x100 - user/company cards
    detail: "medium", // 200x200 - detailed views
    notification: "thumbnail",
  };

  return sizeMap[context] || "small";
};

// Generate appropriate CSS classes for image containers
export const getImageClasses = (
  context:
    | "header"
    | "dashboard"
    | "profile"
    | "card"
    | "detail"
    | "notification",
  shape: "round" | "square" = "round",
  additionalClasses: string = ""
): string => {
  const baseClasses = "object-cover";

  const sizeClasses = {
    header: "w-7 h-7 sm:w-8 sm:h-8",
    dashboard: "w-16 h-16",
    profile: "w-24 h-24",
    card: "w-12 h-12",
    detail: "w-32 h-32",
    notification: "w-10 h-10",
  };

  const shapeClasses = {
    round: "rounded-full",
    square: "rounded-lg",
  };

  return [
    baseClasses,
    sizeClasses[context],
    shapeClasses[shape],
    additionalClasses,
  ]
    .filter(Boolean)
    .join(" ");
};
