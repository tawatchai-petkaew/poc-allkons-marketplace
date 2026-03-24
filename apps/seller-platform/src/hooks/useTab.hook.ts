'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export function useTab<T extends string>(
  paramName: string,
  defaultTab: T,
  allTabs?: readonly T[]
) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<T>(() => {
    const tabFromUrl = searchParams?.get(paramName) as T | null;
    if (tabFromUrl && (!allTabs || allTabs.includes(tabFromUrl))) {
      return tabFromUrl;
    }
    return defaultTab;
  });

  useEffect(() => {
    const tabFromUrl = searchParams?.get(paramName) as T | null;
    if (tabFromUrl && (!allTabs || allTabs.includes(tabFromUrl))) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams, allTabs, paramName]);

  const handleTabChange = (tabKey: T) => {
    setActiveTab(tabKey);
    const url = new URL(window.location.href);
    url.searchParams.set(paramName, tabKey);

    if (paramName === 'tab') {
      url.searchParams.delete('subTab');
    }

    router.push(url.pathname + '?' + url.searchParams.toString());
  };

  return { activeTab, handleTabChange };
}
