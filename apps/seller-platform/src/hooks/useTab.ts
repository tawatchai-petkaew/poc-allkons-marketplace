"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function useTab<T extends string>(
  paramKey: string,
  defaultTab: T,
  validTabs: T[]
): {
  activeTab: T;
  handleTabChange: (tab: T) => void;
} {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<T>(defaultTab);

  useEffect(() => {
    const tabFromUrl = searchParams.get(paramKey) as T | null;
    if (tabFromUrl && validTabs.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    } else {
      setActiveTab(defaultTab);
    }
  }, [searchParams, paramKey, defaultTab, validTabs]);

  const handleTabChange = useCallback(
    (tab: T) => {
      setActiveTab(tab);
      const params = new URLSearchParams(searchParams.toString());
      params.set(paramKey, tab);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams, paramKey]
  );

  return { activeTab, handleTabChange };
}
