'use client';

import { useEffect } from 'react';

export default function LogoutSyncListener() {
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'logout') {
        window.location.href = '/';
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return null;
}
