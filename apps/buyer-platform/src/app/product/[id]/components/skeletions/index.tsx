import { Skeleton } from 'antd';
import './custom.css';

export default function ProductPageSkeletion() {
  return (
    <div className="container mx-auto">
      <div className="py-4 lg:py-[2rem] px-3 sm:px-0">
        <Skeleton active title={true} paragraph={{ rows: 0 }} />
      </div>
      <div className="flex flex-col lg:flex-row">
        <div className="lg:w-[40%] w-full px-4 flex flex-col items-center">
          <div className="w-full flex flex-col gap-8 px-4">
            <Skeleton.Image active className="!w-full !h-auto !aspect-[4/3]" />
            <div className="flex gap-4 w-full h-auto justify-center">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex-1">
                  <Skeleton.Image
                    active
                    className="!w-full !h-auto !aspect-square"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:w-[60%] w-full px-4 mt-[2rem] lg:mt-0">
          <div className="w-full flex flex-col gap-8 px-4">
            <div className="flex flex-col gap-[1rem] w-full">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton
                  key={index}
                  active
                  title={true}
                  paragraph={{ rows: 0 }}
                  className="custom-skeletion"
                />
              ))}
            </div>
            <div className="hidden lg:flex rounded-lg bg-background-primary border border-border-primary py-6 px-3 sm:px-6 flex-col items-center gap-6">
              <Skeleton
                active
                paragraph={{ rows: 1 }}
                className="custom-skeletion"
              />
              <div className="flex gap-4 w-full">
                <Skeleton.Button
                  active
                  className="custom-skeletion-button"
                  size="large"
                />
                <Skeleton.Button
                  active
                  className="custom-skeletion-button"
                  size="large"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Skeleton
        active
        title={true}
        paragraph={{ rows: 10 }}
        className="custom-skeletion !mt-[2rem] !mb-[4rem] !px-4 lg:!px-0"
      />
    </div>
  );
}
