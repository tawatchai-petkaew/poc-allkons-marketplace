'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useNotification } from '@/hooks/notification.hook';
import {
  handleIntendedPathFromCookie,
  setupCrossTabSync,
  isUserAuthenticated,
  clearAuth,
} from '@/utils/auth';

interface GuestModeHandlerProps {
  children: React.ReactNode;
}

const GuestModeHandler = ({ children }: GuestModeHandlerProps) => {
  const searchParams = useSearchParams();
  const { notification } = useNotification();
  const [hasShownNotification, setHasShownNotification] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const notificationShownRef = useRef(new Set<string>());
  const authSyncCleanupRef = useRef<(() => void) | null>(null);

  const scrollToTop = useCallback(() => {
    if ('scrollBehavior' in document.documentElement.style) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo(0, 0);
    }
  }, []);

  const showGuestNotification = useCallback(
    (redirectFrom: string, source?: string) => {
      const notificationKey = `${redirectFrom}-${source || 'default'}`;

      if (notificationShownRef.current.has(notificationKey)) {
        return;
      }

      notificationShownRef.current.add(notificationKey);

      const pageName = getPageNameThai(redirectFrom);
      const sourceText = getSourceText(source);

      notification.info({
        message: 'เข้าสู่ระบบก่อนดำเนินการ',
        description: `กรุณาเข้าสู่ระบบเพื่อเข้าถึงหน้า${pageName}${sourceText}`,
        duration: 5,
        placement: 'bottomRight',
        key: notificationKey,
      });

      setHasShownNotification(true);
    },
    [notification]
  );

  const cleanupUrlParams = useCallback(() => {
    const url = new URL(window.location.href);
    let hasChanges = false;

    if (url.searchParams.has('mode')) {
      url.searchParams.delete('mode');
      hasChanges = true;
    }
    if (url.searchParams.has('from')) {
      url.searchParams.delete('from');
      hasChanges = true;
    }
    if (url.searchParams.has('redirectFrom')) {
      url.searchParams.delete('redirectFrom');
      hasChanges = true;
    }
    if (url.searchParams.has('source')) {
      url.searchParams.delete('source');
      hasChanges = true;
    }
    if (url.searchParams.has('t')) {
      url.searchParams.delete('t');
      hasChanges = true;
    }

    if (hasChanges) {
      window.history.replaceState(
        {},
        document.title,
        url.pathname + url.search + url.hash
      );
    }
  }, []);

  const handleAuthChange = useCallback(() => {
    if (!isUserAuthenticated()) {
      clearAuth();

      const currentPath = window.location.pathname;
      if (currentPath !== '/') {
        window.location.replace(
          '/?mode=guest&from=' +
            encodeURIComponent(currentPath) +
            '&source=cross-tab'
        );
      }
    }
  }, []);

  useEffect(() => {
    if (isInitialized) return;

    handleIntendedPathFromCookie();

    const cleanup = setupCrossTabSync(handleAuthChange);
    authSyncCleanupRef.current = cleanup;

    const mode = searchParams.get('mode');
    if (mode === 'guest') {
      scrollToTop();
    }

    setIsInitialized(true);

    return () => {
      cleanup();
    };
  }, [isInitialized, searchParams, handleAuthChange, scrollToTop]);

  useEffect(() => {
    const mode = searchParams.get('mode');
    const redirectFrom =
      searchParams.get('redirectFrom') || searchParams.get('from');
    const source = searchParams.get('source');

    if (mode === 'guest' && redirectFrom && !hasShownNotification) {
      const timeoutId = setTimeout(() => {
        showGuestNotification(redirectFrom, source || undefined);

        setTimeout(cleanupUrlParams, 100);
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [
    searchParams,
    hasShownNotification,
    showGuestNotification,
    cleanupUrlParams,
  ]);

  useEffect(() => {
    const handlePopState = () => {
      setHasShownNotification(false);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (authSyncCleanupRef.current) {
        authSyncCleanupRef.current();
      }
    };
  }, []);

  if (!isInitialized) {
    return null;
  }

  return <>{children}</>;
};

const getPageNameThai = (path: string): string => {
  const pageNames: Record<string, string> = {
    '/cart': 'ตรวจสอบรถเข็น',
    '/checkout': 'ชำระเงิน',
    '/my-order': 'คำสั่งซื้อของฉัน',
    '/orders': 'คำสั่งซื้อ',
    '/profile': 'ข้อมูลส่วนตัว',
    '/addresses': 'ที่อยู่จัดส่ง',
    '/payment': 'การชำระเงิน',
    '/credit-center': 'ศูนย์เครดิต',
    '/credit': 'เครดิต',
    '/favorite': 'รายการโปรด',
    '/wishlist': 'รายการที่ต้องการ',
    '/account': 'บัญชีผู้ใช้',
    '/settings': 'การตั้งค่า',
  };

  return pageNames[path] || path;
};

const getSourceText = (source?: string): string => {
  const sourceTexts: Record<string, string> = {
    'link-click': ' (จากการคลิกลิงก์)',
    navigation: ' (จากการนำทาง)',
    'cross-tab': ' (จากการออกจากระบบในแท็บอื่น)',
    'back-forward': ' (จากการใช้ปุ่มย้อนกลับ)',
  };

  return sourceTexts[source || ''] || '';
};

export default GuestModeHandler;
