"use client";

import React from "react";
import { Avatar, Grid, Popover } from "antd";
import BadgeLabel from "@/components/BadgeLabel";
import Typography from "@/components/Typography";
import { getFirstChar } from "@/utils/format";
import { IMerchantItem } from "@/interfaces/merchant/merchant.response.interface";

const { useBreakpoint } = Grid;

interface StoreItemProps {
  item: IMerchantItem;
  onMenuItemClick?: (item: IMerchantItem, action: string) => void;
}

export const StoreItem: React.FC<StoreItemProps> = ({
  item,
  onMenuItemClick,
}) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const isActive = item.status === "active";

  const statusBadgeConfig = isActive
    ? {
        text: "เปิดใช้งาน",
        color: "success" as const,
      }
    : {
        text: "ปิดใช้งาน",
        color: "neutral" as const,
      };

  const handleMenuItemClick = (action: string) => {
    onMenuItemClick?.(item, action);
  };

  const ActionButton = (
    <Popover
      content={
        <div className="flex flex-col min-w-[120px]">
          <div
            className="flex items-center gap-2 px-3 py-2 hover:bg-neutral-50 cursor-pointer rounded-lg transition-colors group/item"
            onClick={() => handleMenuItemClick("info")}
          >
            <i className="ri-store-2-line text-lg text-neutral-400 group-hover/item:text-primary transition-colors" />
            <Typography
              variant="paragraph-middle-regular"
              className="!text-text-secondary group-hover/item:!text-primary transition-colors"
            >
              ข้อมูลร้านค้า
            </Typography>
          </div>
        </div>
      }
      trigger="click"
      placement="bottomRight"
    >
      <div className="w-10 h-10 flex items-center justify-center hover:bg-neutral-50 rounded-xl cursor-pointer transition-colors border">
        <i className="ri-more-2-line text-xl text-icon-secondary" />
      </div>
    </Popover>
  );

  const displayName = item.merchantTranslations?.[0]?.name ?? "-";
  const branchName = item.merchantName ?? "-";
  const logoUrl = item.merchantIcon?.imageUpload?.url ?? item.image;
  const totalMembers = item.memberCount ?? 0;

  const AvatarComponent = (
    <Avatar
      shape="square"
      size={48}
      src={logoUrl}
      className="!rounded-xl !bg-neutral-50 !border !border-neutral-100 shrink-0 !text-primary-dark !text-xl !font-bold"
    >
      {getFirstChar(displayName)}
    </Avatar>
  );

  const StoreInfo = (
    <div className="flex flex-col overflow-hidden">
      <Typography
        variant="paragraph-big-medium"
        className="!leading-normal truncate"
      >
        {displayName}
      </Typography>
      <Typography
        variant="paragraph-small-regular"
        className="!text-text-quarternary !leading-normal mt-0.5"
      >
        {branchName}
      </Typography>
    </div>
  );

  if (isMobile) {
    return (
      <div className="bg-white rounded-2xl p-4 flex flex-col gap-4 border border-neutral-100">
        <div className="flex gap-3 items-start">
          {AvatarComponent}
          <div className="flex-1 min-w-0">{StoreInfo}</div>
          {ActionButton}
        </div>
        <div className="flex justify-between items-center pr-[48px]">
          <div className="flex items-center gap-2">
            <i className="ri-group-line text-icon-tertiary text-lg" />
            <Typography
              variant="paragraph-middle-regular"
              className="!text-text-secondary"
            >
              {totalMembers} สมาชิก
            </Typography>
          </div>
          <BadgeLabel variant="ghost" rounding="pill" {...statusBadgeConfig} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 grid grid-cols-[2fr_1fr_1fr_48px] gap-4 items-center border border-neutral-100 hover:border-primary/50 hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.03)] transition-all cursor-pointer">
      {/* Store name + branch */}
      <div className="flex items-center gap-4 min-w-0">
        {AvatarComponent}
        {StoreInfo}
      </div>

      {/* Member count */}
      <div className="flex items-center gap-2">
        <i className="ri-group-line text-text-tertiary text-lg bg-background-secondary rounded-md px-1" />
        <Typography
          variant="paragraph-middle-regular"
          className="!text-text-tertiary"
        >
          {totalMembers}
        </Typography>
      </div>

      {/* Status */}
      <div className="flex items-center">
        <BadgeLabel variant="ghost" rounding="pill" {...statusBadgeConfig} />
      </div>

      {/* Action */}
      <div className="flex justify-end">{ActionButton}</div>
    </div>
  );
};
