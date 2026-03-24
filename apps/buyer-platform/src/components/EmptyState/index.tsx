import NextImage from 'next/image';
import Typography from '../Typography';
import { FC } from 'react';

export const EmptyStateComponent: FC<{
  size?: number;
  height?: number;
  descriptionNode?: React.ReactNode;
}> = ({
  size,
  height = 220,
  descriptionNode = (
    <Typography
      variant="paragraph-big"
      className="!font-medium !text-text-secondary"
    >
      ยังไม่มีข้อมูล
    </Typography>
  ),
}) => {
  return (
    <div
      className="flex flex-col gap-2 items-center justify-center "
      style={{ minHeight: height ? `${height}px` : '220px' }}
    >
      <NextImage
        src="/assets/icons/empty.svg"
        alt="empty-state"
        width={size || 160}
        height={size || 160}
      />
      {descriptionNode}
    </div>
  );
};
