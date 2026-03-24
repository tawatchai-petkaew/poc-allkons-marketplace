'use client';

import { memo } from 'react';
import { createPortal } from 'react-dom';
import Lottie from 'lottie-react';
import loadingAnimation from '../../../../public/animations/logo-loading.json';

interface LoadingOverlayProps {
  visible?: boolean;
  size?: number;
}

/**
 * LoadingOverlay - Full screen loading overlay with Lottie animation
 * Renders using React Portal to overlay entire screen
 *
 * @param visible - Whether to show the overlay
 * @param size - Size of the loading animation in pixels (default: 60)
 */
const LoadingOverlay = memo<LoadingOverlayProps>(({ visible = false, size = 60 }) => {
  // Don't render if not visible or in SSR
  if (!visible || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center" style={{ zIndex: 9999 }}>
      <Lottie animationData={loadingAnimation} loop={true} style={{ width: size, height: size }} />
    </div>,
    document.body,
  );
});

LoadingOverlay.displayName = 'LoadingOverlay';

export default LoadingOverlay;
