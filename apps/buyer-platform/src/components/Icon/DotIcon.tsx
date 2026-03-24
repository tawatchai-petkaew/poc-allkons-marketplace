import { LabelSize } from '../Label';
import React, { FC } from 'react';

type DotIconProps = {
  size?: LabelSize;
  color?: string;
};

const DotIcon: FC<DotIconProps> = ({
  size = 'middle',
  color,
}: DotIconProps) => {
  const sizeClassName: Record<LabelSize, string> = {
    small: 'w-[6px] h-[6px]',
    middle: 'w-[8px] h-[8px]',
    large: 'w-[10px] h-[10px]',
  };
  return <div className={`${sizeClassName[size]} bg-${color} rounded-full`} />;
};

export default DotIcon;
