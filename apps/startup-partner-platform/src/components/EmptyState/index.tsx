'use client';

import Image from 'next/image';
import Typography from '@/components/Typography';

interface EmptyStateProps {
  size?: number;
  height?: number;
  message?: string;
  descriptionNode?: React.ReactNode;
}

export const EmptyStateComponent: React.FC<EmptyStateProps> = ({
  size,
  height = 220,
  message = 'ยังไม่มีข้อมูล',
  descriptionNode,
}) => {
  const defaultDescription = (
    <Typography variant="paragraph-big" className="!font-medium !text-text-secondary">
      {message}
    </Typography>
  );

  return (
    <div
      className="flex flex-col gap-2 items-center justify-center"
      style={{ minHeight: height ? `${height}px` : '220px' }}
    >
      <Image src="/images/icons/empty.svg" alt="empty-state" width={size || 160} height={size || 160} />
      {descriptionNode || defaultDescription}
    </div>
  );
};

export default EmptyStateComponent;
