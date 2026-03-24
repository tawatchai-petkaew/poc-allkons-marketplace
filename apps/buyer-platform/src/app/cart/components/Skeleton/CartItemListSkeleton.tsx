import { Skeleton } from 'antd';

function CartItemListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Skeleton active title={{ width: '100%' }} paragraph={{ rows: 0 }} />
        <Skeleton active title={{ width: '100%' }} paragraph={{ rows: 0 }} />
      </div>
      <div className="flex flex-col gap-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex gap-4">
            <Skeleton.Image active />
            <Skeleton
              active
              title={{ width: '100%' }}
              paragraph={{ rows: 2 }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
export default CartItemListSkeleton;
