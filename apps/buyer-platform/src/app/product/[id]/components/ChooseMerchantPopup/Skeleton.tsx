import { Skeleton } from 'antd';

function MerchantPopupSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton active title={true} paragraph={{ rows: 1 }} />
      <Skeleton.Button active className="!w-full !mt-[1rem]" size="small" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton.Button
            active
            key={index}
            className="!w-full !h-[3rem] md:!h-[4rem]"
          />
        ))}
      </div>
    </div>
  );
}
export default MerchantPopupSkeleton;
