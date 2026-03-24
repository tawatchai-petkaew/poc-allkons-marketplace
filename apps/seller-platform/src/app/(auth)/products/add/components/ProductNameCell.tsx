import React, { memo } from 'react';
import { Popover } from 'antd';
import Image from '@/components/Image';
import Typography from '@/components/Typography';

interface ProductNameCellProps {
  image: string | null;
  name: string;
  brand: string;
  showPopover?: boolean;
}

/**
 * Shared product name cell component for tables
 * Used in both product selection and detail views
 */
const ProductNameCell: React.FC<ProductNameCellProps> = ({
  image,
  name,
  brand,
  showPopover = false,
}: ProductNameCellProps) => {
  return (
    <div className="flex gap-2">
      <Image
        src={image}
        alt={name}
        name={name}
        type="product"
        className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden"
      />
      <div className="flex flex-col justify-center">
        {showPopover ? (
          <Popover
            content={
              <div className="flex flex-col gap-1">
                <Typography variant="paragraph-small" className="!text-text-primary !font-medium">
                  ชื่อสินค้า
                </Typography>
                <Typography variant="paragraph-small" className="!text-text-secondary">
                  {name}
                </Typography>
              </div>
            }
            trigger="click"
            placement="top"
            overlayStyle={{ maxWidth: '400px' }}
          >
            <div
              className="text-sm text-text-primary font-normal cursor-pointer overflow-hidden"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {name}
            </div>
          </Popover>
        ) : (
          <Typography variant="paragraph-small" className="!text-text-primary">
            {name}
          </Typography>
        )}
        <Typography variant="paragraph-extra-small" className="!text-text-tertiary">
          {brand}
        </Typography>
      </div>
    </div>
  );
};

export default memo(ProductNameCell);
