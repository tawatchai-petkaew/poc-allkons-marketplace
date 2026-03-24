'use client';

import React, { useState, useEffect, memo, type ImgHTMLAttributes } from 'react';

const DEFAULT_IMAGE_CLASS =
  'w-[40px] h-[40px] relative shrink-0 rounded overflow-hidden bg-background-secondary flex items-center justify-center';

const FALLBACK_IMAGES = {
  product: '/images/product/default.svg',
  store: '/images/store/default.png',
  default: '/images/icons/empty.svg',
} as const;

type ImageType = keyof typeof FALLBACK_IMAGES;

interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  /** Image source URL - primary prop */
  src?: string | null;
  /** Image source URL - alternative prop (legacy support) */
  image?: string | null;
  /** Alt text for the image */
  alt?: string;
  /** Name used as fallback for alt text */
  name?: string;
  /** Container className (defaults to 40x40 rounded) */
  className?: string;
  /** Type of fallback image to show on error */
  type?: ImageType;
  /** Custom fallback image source (overrides type) */
  defaultImageSrc?: string;
}

/**
 * Improved Image component with fallback support
 *
 * Features:
 * - Automatic fallback to default images on error
 * - Type-safe fallback image selection
 * - Error state reset when source changes
 * - Memoized for performance
 * - Full TypeScript support
 *
 * @example
 * <Image src={product.imageUrl} alt={product.name} type="product" />
 */
const Image: React.FC<ImageProps> = ({
  name,
  image,
  src,
  alt,
  className,
  type = 'default',
  defaultImageSrc,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const finalClass = className || DEFAULT_IMAGE_CLASS;
  const imageSource = image || src;
  const fallbackImage = defaultImageSrc || FALLBACK_IMAGES[type];

  // Reset error state when image source changes
  useEffect(() => {
    setHasError(false);
  }, [imageSource]);

  const altText = alt || name || 'Image';

  // Show fallback if no source or error occurred
  if (!imageSource || hasError) {
    return (
      <div className={finalClass}>
        <img
          src={fallbackImage}
          alt={`${altText} (default)`}
          className="w-full h-full object-cover"
          {...props}
        />
      </div>
    );
  }

  return (
    <div className={finalClass}>
      <img
        src={imageSource}
        alt={altText}
        className="w-full h-full object-cover"
        onError={() => setHasError(true)}
        {...props}
      />
    </div>
  );
};

export default memo(Image);
