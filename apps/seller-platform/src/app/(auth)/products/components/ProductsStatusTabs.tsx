"use client";

import { IMerchantProductCountResponse } from "@/interfaces/product/product.response.interface";
import { PRODUCT_STATUS_TABS } from "../constants/products.constants";

interface ProductsStatusTabsProps {
  currentStatus: string;
  statusCounts: IMerchantProductCountResponse;
  onStatusChange: (status: string) => void;
}

export const ProductsStatusTabs: React.FC<ProductsStatusTabsProps> = ({
  currentStatus,
  statusCounts,
  onStatusChange,
}) => {
  return (
    <div className="flex gap-2">
      {PRODUCT_STATUS_TABS.map((tab) => (
        <div
          key={tab.value}
          className={`rounded-full py-[10px] px-4 cursor-pointer ${
            currentStatus === tab.value || (!currentStatus && tab.value === "ALL")
              ? "bg-primary text-white"
              : "border border-border-primary"
          }`}
          onClick={() => onStatusChange(tab.value)}
        >
          {tab.label} ({statusCounts[tab.value as keyof IMerchantProductCountResponse] ?? 0})
        </div>
      ))}
    </div>
  );
};
