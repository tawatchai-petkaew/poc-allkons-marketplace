"use client";

import { Grid, Skeleton } from "antd";

const { useBreakpoint } = Grid;

export const StoreSkeleton = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  if (isMobile) {
    return (
      <div className="bg-white rounded-2xl p-4 flex flex-col gap-4 border border-neutral-100">
        <div className="flex gap-3 items-start">
          <Skeleton.Avatar active size={48} shape="square" />
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton.Input active size="small" style={{ width: "60%" }} />
            <Skeleton.Input active size="small" style={{ width: "40%" }} />
          </div>
          <Skeleton.Button
            active
            size="large"
            style={{ width: 40, height: 40 }}
          />
        </div>
        <div className="flex justify-between items-center pr-[48px]">
          <Skeleton.Input active size="small" style={{ width: 80 }} />
          <Skeleton.Button active size="small" style={{ width: 100 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 grid grid-cols-[2fr_1fr_1fr_48px] gap-4 items-center border border-neutral-100">
      <div className="flex items-center gap-4 min-w-0">
        <Skeleton.Avatar active size={48} shape="square" />
        <div className="flex-1 space-y-2">
          <Skeleton.Input active size="small" style={{ width: "70%" }} />
          <Skeleton.Input active size="small" style={{ width: "50%" }} />
        </div>
      </div>
      <Skeleton.Input active size="small" style={{ width: "60%" }} />
      <Skeleton.Button active size="small" style={{ width: 100 }} />
      <Skeleton.Button active size="large" style={{ width: 40, height: 40 }} />
    </div>
  );
};
