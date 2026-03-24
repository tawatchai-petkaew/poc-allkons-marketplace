import { Grid, Skeleton } from 'antd';

export default function CategoryPageSkeleton() {
  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;

  return (
    <div className="container mx-auto px-3 sm:px-0 sm:py-4">
      <div className=" hidden sm:flex flex-col gap-4">
        <Skeleton active title={{ width: 400 }} paragraph={{ rows: 0 }} />
        <Skeleton.Button active style={{ width: 378 }} />
      </div>
      <div className={`py-12 grid grid-cols-4 sm:grid-cols-8 gap-4`}>
        {Array.from({ length: isMobile ? 4 : 8 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-2">
            <Skeleton.Button
              active
              className="!w-full !h-auto !aspect-square"
            />
            <Skeleton
              active
              title={{ width: '100%' }}
              paragraph={{ rows: 0 }}
            />
          </div>
        ))}
      </div>
      <div>
        <div className="hidden sm:flex justify-between">
          <Skeleton.Button active style={{ width: 240 }} />
          <Skeleton.Button active style={{ width: 80 }} />
        </div>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-[2rem]">
          {Array.from({ length: 15 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-2">
              <Skeleton.Button
                active
                className="!w-full !h-auto !aspect-square"
              />
              <Skeleton
                active
                title={{ width: '50%' }}
                paragraph={{ rows: 2 }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
