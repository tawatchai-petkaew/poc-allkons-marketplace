import { useQuery, useMutation, useQueryClient, queryOptions } from '@tanstack/react-query';
import {
  searchBatchList,
  deleteBatch,
  completeBatch,
  downloadOriginalFile,
  downloadMatchingResult,
  cancelBatch,
} from '@/api/import-product.api';
import { IRequestQueryBatchList } from '@/interfaces/product/import-product.request.interface';
import { getApiStatusFromUiStatus } from '../constants';
import { useNotification } from '@/hooks/useNotification';

const successIcon = <i className="ri-checkbox-circle-line" />;
const errorIcon = <i className="ri-information-line" />;

/**
 * Query options for fetching the list of batch imports (Product Matching).
 */
export const batchListQueryOptions = (params: IRequestQueryBatchList) => {
  const apiStatus = getApiStatusFromUiStatus(params.status);
  const apiParams = { ...params, status: apiStatus || undefined };

  return queryOptions({
    queryKey: ['batchList', apiParams],
    queryFn: () => searchBatchList(apiParams),
    refetchInterval: (query) => {
      // Auto refetch if any batch is in MATCHING status
      const statusCounts = query.state.data?.data?.statusCounts;
      const matchingCount = statusCounts?.MATCHING || 0;
      return matchingCount > 0 ? 30000 : false;
    },
  });
};

/**
 * Hook for fetching the list of batch imports (Product Matching).
 */
export const useBatchListQuery = (params: IRequestQueryBatchList) => {
  return useQuery(batchListQueryOptions(params));
};

/**
 * Hook for deleting a batch import.
 */
export const useDeleteBatchMutation = () => {
  const { notification } = useNotification();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (batchUuid: string) => deleteBatch(batchUuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batchList'] });
      queryClient.invalidateQueries({ queryKey: ['batchListCounts'] });
      notification.success({
        message: 'ลบสำเร็จ',
        description: 'ลบไฟล์เรียบร้อย',
        icon: successIcon,
        duration: 3,
      });
    },
    onError: () => {
      notification.error({
        message: 'ลบไม่สำเร็จ',
        description: 'ไม่สามารถลบไฟล์ได้ โปรดลองใหม่อีกครั้ง',
        icon: errorIcon,
        duration: 3,
      });
    },
  });
};

/**
 * Hook for completing a batch import.
 */
export const useCompleteBatchMutation = () => {
  const queryClient = useQueryClient();
  const { notification } = useNotification();

  return useMutation({
    mutationFn: (batchUuid: string) => completeBatch(batchUuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batchList'] });
      queryClient.invalidateQueries({ queryKey: ['batchListCounts'] });
      notification.success({
        message: 'บันทึกสำเร็จ',
        description: 'บันทึกการเปลี่ยนแปลงการจับคู่เรียบร้อย',
        icon: successIcon,
        duration: 3,
      });
    },
    onError: () => {
      notification.error({
        message: 'บันทึกไม่สำเร็จ',
        description: 'ไม่สามารถบันทึกการเปลี่ยนแปลงได้ โปรดลองใหม่อีกครั้ง',
        icon: errorIcon,
        duration: 3,
      });
    },
  });
};

/**
 * Hook for canceling a batch import.
 */
export const useCancelBatchMutation = () => {
  const queryClient = useQueryClient();
  const { notification } = useNotification();
  return useMutation({
    mutationFn: (batchUuid: string) => cancelBatch(batchUuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batchList'] });
      queryClient.invalidateQueries({ queryKey: ['batchListCounts'] });
      notification.success({
        message: 'ยกเลิกสำเร็จ',
        description: 'ยกเลิกการจับคู่เรียบร้อย',
        icon: successIcon,
        duration: 3,
      });
    },
    onError: () => {
      notification.error({
        message: 'ยกเลิกไม่สำเร็จ',
        description: 'ไม่สามารถยกเลิกการจับคู่ได้ โปรดลองใหม่อีกครั้ง',
        icon: errorIcon,
        duration: 3,
      });
    },
  });
};

/**
 * Hook for downloading the original file of a batch import.
 */
export const useDownloadOriginalFileMutation = () => {
  const { notification } = useNotification();
  return useMutation({
    mutationFn: (batchUuid: string) => downloadOriginalFile(batchUuid),
    onSuccess: (response) => {
      // API returns an ApiResponse<IDownloadOriginalResponse> containing url and filename
      const url = response.data?.url;
      const filename = response.data?.filename;
      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename || 'original-file');
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
      notification.success({
        message: 'ดาวน์โหลดสำเร็จ',
        description: 'ดาวน์โหลดไฟล์เรียบร้อย',
        icon: successIcon,
        duration: 3,
      });
    },
    onError: () => {
      notification.error({
        message: 'ดาวน์โหลดไม่สำเร็จ',
        description: 'ไม่สามารถดาวน์โหลดไฟล์ได้ โปรดลองใหม่อีกครั้ง',
        icon: errorIcon,
        duration: 3,
      });
    },
  });
};

/**
 * Hook for downloading the matching result.
 */
export const useDownloadMatchingResultMutation = () => {
  const { notification } = useNotification();
  return useMutation({
    mutationFn: (batchUuid: string) => downloadMatchingResult(batchUuid),
    onSuccess: () => {
      notification.success({
        message: 'ดาวน์โหลดสำเร็จ',
        description: 'ดาวน์โหลดไฟล์เรียบร้อย',
        icon: successIcon,
        duration: 3,
      });
    },
    onError: () => {
      notification.error({
        message: 'ดาวน์โหลดไม่สำเร็จ',
        description: 'ไม่สามารถดาวน์โหลดไฟล์ได้ โปรดลองใหม่อีกครั้ง',
        icon: errorIcon,
        duration: 3,
      });
    },
  });
};
