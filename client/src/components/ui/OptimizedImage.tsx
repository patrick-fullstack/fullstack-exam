// client/src/components/ui/OptimizedImage.tsx
import React from "react";
import {
  getImageUrl,
  hasImage,
  getContextualSize,
  getImageClasses,
} from "../../utils/imageUtils";
import type { ImageFormats, ImageFormat } from "../../types/image-format";

interface OptimizedImageProps {
  images: ImageFormats | string | undefined | null;
  context:
    | "header"
    | "dashboard"
    | "profile"
    | "card"
    | "detail"
    | "notification";
  shape?: "round" | "square";
  alt: string;
  fallback?: React.ReactNode;
  className?: string;
  preferredSize?: ImageFormat;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  images,
  context,
  shape = "round",
  alt,
  fallback,
  className = "",
  preferredSize,
}) => {
  const size = preferredSize || getContextualSize(context);
  const imageUrl = getImageUrl(images, size);
  const imageClasses = getImageClasses(context, shape, className);

  if (!hasImage(images)) {
    return <>{fallback}</>;
  }

  return (
    <img src={imageUrl!} alt={alt} className={imageClasses} loading="lazy" />
  );
};

// Avatar-specific component
interface AvatarImageProps {
  user: { firstName: string; lastName: string; avatar?: ImageFormats | string };
  context: "header" | "dashboard" | "profile" | "card" | "notification";
  className?: string;
  preferredSize?: ImageFormat;
}

export const AvatarImage: React.FC<AvatarImageProps> = ({
  user,
  context,
  className = "",
  preferredSize,
}) => {
  const fallbackClasses = getImageClasses(
    context,
    "round",
    "bg-green-600 flex items-center justify-center text-white font-bold"
  );
  const textSize =
    context === "header"
      ? "text-xs sm:text-sm"
      : context === "notification"
      ? "text-sm"
      : "text-xl";

  return (
    <OptimizedImage
      images={user.avatar}
      context={context}
      alt={`${user.firstName} ${user.lastName}`}
      className={className}
      preferredSize={preferredSize}
      fallback={
        <div className={fallbackClasses}>
          <span className={textSize}>
            {user.firstName.charAt(0).toUpperCase()}
            {user.lastName.charAt(0).toUpperCase()}
          </span>
        </div>
      }
    />
  );
};

// Company logo-specific component
interface CompanyLogoProps {
  company: { name: string; logo?: ImageFormats | string };
  context: "card" | "detail";
  className?: string;
  preferredSize?: ImageFormat;
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  company,
  context,
  className = "",
  preferredSize,
}) => {
  const fallbackClasses = getImageClasses(
    context,
    "square",
    "bg-gray-200 flex items-center justify-center"
  );
  const textSize = context === "card" ? "text-xl" : "text-2xl";

  return (
    <OptimizedImage
      images={company.logo}
      context={context}
      shape="square"
      alt={`${company.name} logo`}
      className={className}
      preferredSize={preferredSize}
      fallback={
        <div className={fallbackClasses}>
          <span className={`${textSize} font-bold text-gray-500`}>
            {company.name.charAt(0).toUpperCase()}
          </span>
        </div>
      }
    />
  );
};
