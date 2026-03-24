import { Skeleton } from 'antd';
import { useScreenWidth } from '@/hooks/useScreenWidth';

function CategorySectionSkeleton() {
  const screenWidth = useScreenWidth();
  const resolvedGrid =
    screenWidth < 1024 ? 4 : screenWidth > 1024 && screenWidth < 1280 ? 6 : 8;

  return (
    <div>
      <div className="flex justify-between items-center md:!px-5 !px-1 mt-5">
        <Skeleton.Button active className="!w-[200px]" />
        <div className="flex gap-2">
          <Skeleton.Button active />
          <Skeleton.Button active />
        </div>
      </div>
      <div className="grid grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 md:!px-5 !px-1 mt-5">
        {Array.from({ length: resolvedGrid }).map((_, index) => (
          <div key={index} className="flex flex-col gap-2 w-full">
            <Skeleton.Image active className="!w-full !h-auto !aspect-square" />
            <Skeleton active title={true} paragraph={false} />
          </div>
        ))}
      </div>
    </div>
  );
}
export default CategorySectionSkeleton;
