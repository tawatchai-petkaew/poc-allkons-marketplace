import { useState, useCallback } from "react";
import { exportProducts } from "@/api/product.api";
import { IRequestExportProducts } from "@/interfaces/product/product.request.interface";
import { message } from "antd";
import { PRODUCT_EXPORT_MESSAGES } from "../constants/products.constants";

export const useProductExport = (merchantSlug: string) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(
    async (filters?: IRequestExportProducts) => {
      if (!merchantSlug) {
        message.error(PRODUCT_EXPORT_MESSAGES.NO_MERCHANT);
        return;
      }

      setIsExporting(true);

      try {
        const result = await exportProducts(merchantSlug, filters);

        if (result.success) {
          message.success(PRODUCT_EXPORT_MESSAGES.SUCCESS(result.filename));
        }
      } catch (error) {
        console.error("Export failed:", error);
        message.error(PRODUCT_EXPORT_MESSAGES.ERROR);
      } finally {
        setIsExporting(false);
      }
    },
    [merchantSlug]
  );

  return {
    isExporting,
    handleExport,
  };
};
