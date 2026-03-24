'use client';

import {
  IProduct,
  ProductDiscount,
} from '@/common/interfaces/product.interface';
import {
  calculateDiscountPercentage,
  formatThaiBaht,
  getDiscountPrice,
  getFinalPrice,
} from '@/utils/format';
import { Grid } from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';
import Typography from '../../Typography';

const HorizontalDiscountBadge: React.FC<{
  width?: number | string;
  height?: number | string;
  children?: React.ReactNode;
}> = ({ children, width = 63, height = 32, ...restProps }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 63 32"
    preserveAspectRatio="xMidYMid meet"
    fill="none"
    {...restProps}
  >
    <path
      fill="url(#a)"
      d="M0.61 2.87A2 2 0 0 1 2.186 0H63V32H2.143A2 2 0 0 1 0.332 29.153L6.6 15.75 0.61 2.87Z"
      transform={`scale(${+width / 63} ${+height / 32})`}
    />
    {children && (
      <foreignObject x="0" y="0" width={width} height={height}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            color: 'white', // Default text color to match the badge
            fontSize: '12px', // Default font size
            fontWeight: 'medium', // Default font weight
          }}
        >
          {children}
        </div>
      </foreignObject>
    )}
    <defs>
      <linearGradient
        id="a"
        x1={6.604 * (+width / 63)}
        x2={60.465 * (+width / 63)}
        y1={16 * (+height / 32)}
        y2={16 * (+height / 32)}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#33BF69" />
        <stop offset={1} stopColor="#00AF43" />
      </linearGradient>
    </defs>
  </svg>
);
interface CardProductProps {
  product: IProduct;
}

const CardProduct: FC<CardProductProps> = ({ product }) => {
  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;
  const price = product.productItems[0]?.price;
  const discount = getDiscountPrice(
    price,
    product.productItems[0]?.productDiscount as ProductDiscount
  );

  const finalPrice = getFinalPrice(price, discount);

  const maxFinalPriceLength = isMobile ? 6 : 4;
  const maxPriceLength = isMobile ? 16 : 11;

  return (
    <div className="border-[0.5px] bg-background-primary border-neutral-border p-2 rounded-2xl relative w-full h-full cursor-pointer group hover:border-primary hover:shadow-lg transition-all duration-300">
      <Link href={`/product/${product.slug}`}>
        <div className="bg-neutral-bg w-full relative aspect-square mb-2 rounded flex items-center justify-center group-hover:bg-black/10 transition-colors duration-300">
          {product.productImages[0]?.imageUpload?.url &&
          product.productImages[0]?.imageUpload?.url !== '' ? (
            <Image
              src={product.productImages[0]?.imageUpload?.url}
              alt={product.name}
              fill
              className="object-cover rounded-lg"
              loading="lazy"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.src = '/image-default.png';
              }}
            />
          ) : (
            <Image
              src="/image-default.png"
              alt={product.name}
              fill
              className="object-cover rounded-lg"
              loading="lazy"
            />
          )}
        </div>
        {/* Ribbon */}
        {discount > 0 && (
          <div
            className={`absolute top-5 ${
              isMobile ? '-right-1' : 'right-0'
            } z-10`}
          >
            <HorizontalDiscountBadge width={isMobile ? 60 : undefined}>
              <Typography
                variant={
                  isMobile ? 'paragraph-small-regular' : 'label-selection'
                }
                className="!text-white !font-normal !z-10"
              >
                {calculateDiscountPercentage(price, finalPrice)}%
              </Typography>
            </HorizontalDiscountBadge>
          </div>
        )}

        <div className="px-1 py-1">
          <Typography
            variant={
              isMobile
                ? 'paragraph-extra-small-medium'
                : 'paragraph-middle-medium'
            }
            className={`!line-clamp-2 !text-text-secondary ${
              isMobile ? '!h-[2rem]' : '!h-[3rem]'
            } !mb-3 !text-ellipsis !overflow-hidden`}
          >
            {product.name}
          </Typography>
          {discount > 0 ? (
            <div
              className={`flex gap-2 items-center ${
                finalPrice.toString().length > maxFinalPriceLength
                  ? 'flex-col !items-start !gap-0'
                  : ''
              }`}
            >
              <Typography
                variant={'h4'}
                className={`!text-primary !truncate !max-w-full`}
              >
                {formatThaiBaht(finalPrice)}
              </Typography>
              <div
                className={`flex ${
                  finalPrice.toString().length <= maxFinalPriceLength
                    ? 'mt-1'
                    : ''
                }`}
              >
                <Typography
                  variant={
                    isMobile ? 'paragraph-extra-small' : 'paragraph-small'
                  }
                  className={`!text-[#5b6a83] line-through ${
                    isMobile ? '!font-normal mt-0' : 'mt-2'
                  } !truncate !max-w-[13em]`}
                >
                  {formatThaiBaht(price)}
                </Typography>
                <Typography
                  variant={
                    isMobile ? 'paragraph-extra-small' : 'paragraph-small'
                  }
                  className={`${
                    isMobile
                      ? '!text-text-secondary !font-normal mt-0'
                      : '!text-text-tertiary mt-2'
                  } shrink-0`}
                >
                  / {product?.bigUnit || product?.unit}
                </Typography>
              </div>
            </div>
          ) : (
            <div
              className={`flex gap-2 items-center ${
                price?.toString().length > maxPriceLength
                  ? 'flex-col !items-start'
                  : ''
              }`}
            >
              <Typography variant={'h4'} className="!text-primary">
                {formatThaiBaht(price)}
              </Typography>
              <Typography
                variant={isMobile ? 'paragraph-extra-small' : 'paragraph-small'}
                className={`${
                  isMobile
                    ? '!text-text-secondary !font-normal mt-0'
                    : '!text-text-tertiary mt-2'
                } ${price?.toString().length <= maxPriceLength ? '!mt-1' : ''}`}
              >
                / {product?.bigUnit || product?.unit}
              </Typography>
            </div>
          )}
        </div>
        <div className="pt-0 px-1">
          <Typography
            variant={isMobile ? 'paragraph-extra-small' : 'paragraph-small'}
            className={`!text-text-tertiary ${isMobile ? '!font-normal' : ''}`}
          >
            ขายแล้ว {product?.soldQuantity || 0}
          </Typography>
        </div>
      </Link>
    </div>
  );
};

export default CardProduct;
