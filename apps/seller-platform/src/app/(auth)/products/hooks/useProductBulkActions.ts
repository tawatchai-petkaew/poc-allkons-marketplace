import { useCallback } from "react";

interface UseProductBulkActionsProps {
  selectedRowKeys: React.Key[];
  getAllCachedProducts: () => any[];
  onBulkUpdateStatus: (keys: React.Key[], status: string, cacheMap: Record<string | number, string>) => void;
  onBulkDelete: (keys: React.Key[], cacheMap: Record<string | number, string>) => void;
}

export const useProductBulkActions = ({
  selectedRowKeys,
  getAllCachedProducts,
  onBulkUpdateStatus,
  onBulkDelete,
}: UseProductBulkActionsProps) => {
 
  const createCacheMap = useCallback(() => {
    const arr = getAllCachedProducts();
    return Object.fromEntries(
      arr.map((p) => [p.id, p])
    ) as Record<string | number, string>;
  }, [getAllCachedProducts]);

  const handleBulkShow = useCallback(() => {
    const cacheMap = createCacheMap();
    onBulkUpdateStatus(selectedRowKeys, "Selling", cacheMap);
  }, [selectedRowKeys, onBulkUpdateStatus, createCacheMap]);

  const handleBulkHide = useCallback(() => {
    const cacheMap = createCacheMap();
    onBulkUpdateStatus(selectedRowKeys, "Hidden", cacheMap);
  }, [selectedRowKeys, onBulkUpdateStatus, createCacheMap]);

  const handleBulkDeleteClick = useCallback(() => {
    const cacheMap = createCacheMap();
    onBulkDelete(selectedRowKeys, cacheMap);
  }, [selectedRowKeys, onBulkDelete, createCacheMap]);

  return {
    handleBulkShow,
    handleBulkHide,
    handleBulkDeleteClick,
  };
};
