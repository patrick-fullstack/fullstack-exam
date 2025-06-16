export interface ImageFormats {
  original?: string;
  thumbnail?: string;
  small?: string;
  medium?: string;
}

export const IMAGE_SIZES = {
  avatar: {
    thumbnail: { width: 50, height: 50, crop: "fill" },
    small: { width: 100, height: 100, crop: "fill" },
    medium: { width: 200, height: 200, crop: "fill" },
  },
  logo: {
    thumbnail: { width: 100, height: 100, crop: "fill" },
    small: { width: 200, height: 200, crop: "fill" },
    medium: { width: 300, height: 300, crop: "fill" },
  },
} as const;

export const CSS_SIZE_CLASSES = {
  thumbnail: "w-12 h-12",
  small: "w-24 h-24",
  medium: "w-48 h-48",
};

export const SIZE_MAPPING = {
  thumbnail: "thumbnail",
  small: "small",
  medium: "medium",
} as const;

export type ImageType = keyof typeof IMAGE_SIZES;
export type ImageFormat = keyof ImageFormats;
