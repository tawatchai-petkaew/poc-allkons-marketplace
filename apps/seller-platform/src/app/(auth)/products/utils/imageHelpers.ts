/**
 * Helper function to show image with fallback
 * Returns appropriate fallback image based on type if URL is invalid
 *
 * @param URL - Image URL (can be null or undefined)
 * @param type - Type of image (profile, product, store)
 * @returns Valid image URL or fallback
 */
export const showImage = (URL: string | null | undefined, type: string): string => {
  if (URL && URL.startsWith('https') && /\.(jpg|jpeg|png|gif)$/i.test(URL)) {
    return URL;
  }

  switch (type) {
    case 'profile':
      return '/images/avatar/no-image-org.png';
    case 'product':
      return '/images/product/default.png';
    case 'store':
      return '/images/store/default.png';
    default:
      return '/images/avatar/no-image.png';
  }
};
