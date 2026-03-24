import { ProductFlashSale } from '@/common/interfaces/FlashSales.interface';
import { calculateDiscountPercentage, formatThaiBaht } from '@/utils/format';
import { Grid } from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import { Label } from '../../Label';
import Typography from '../../Typography';

const VerticalDiscountBadge: React.FC<{
  width?: number | string;
  height?: number | string;
  children?: React.ReactNode;
}> = ({ children, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 52 52"
    preserveAspectRatio="xMidYMid meet"
    width={props.width || '100%'}
    height={props.height || '100%'}
    fill="none"
    {...props}
  >
    <path
      fill="url(#a)"
      d="M2.47 51.506A2 2 0 0 1 0 49.562V4.102a4 4 0 0 1 4-4h44a4 4 0 0 1 4 4V49.58a2 2 0 0 1-2.455 1.947l-23.951-5.6-23.125 5.579Z"
    />
    <defs>
      <linearGradient
        id="a"
        x1={26}
        x2={26}
        y1={45.923}
        y2={2.161}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#33BF69" />
        <stop offset={1} stopColor="#00AF43" />
      </linearGradient>
    </defs>
    {children && (
      <foreignObject x="0" y="0" width="52" height="52">
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          {children}
        </div>
      </foreignObject>
    )}
  </svg>
);

interface Props {
  product: ProductFlashSale;
  isExpired?: boolean;
}

export default function CardPromotion({ product, isExpired = false }: Props) {
  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;

  return (
    <Link
      href={'/product'}
      className={`outline-none ${isExpired ? 'pointer-events-none' : ''}`}
    >
      <div
        className={`relative flex gap-4 bg-background-primary hover:bg-background-primary-hover transition-colors duration-100 rounded-2xl w-full h-full ${
          isMobile ? 'p-2 min-h-[8.125rem]' : 'p-3 min-h-[10.375rem]'
        }`}
      >
        {/* ribbons */}
        {!isExpired && (
          <div
            className={`absolute top-0 left-0 transform translate-x-[10%] -translate-y-[20%] w-[5rem] ${
              isMobile
                ? 'bottom-[6rem] left-[1rem]'
                : 'bottom-[7.8rem] left-[1.5rem]'
            }`}
          >
            <VerticalDiscountBadge
              width={isMobile ? 40 : 52}
              height={isMobile ? 40 : 52}
            >
              <Typography
                variant={isMobile ? 'paragraph-small' : 'paragraph-big'}
                className="!text-white"
              >
                -
                {calculateDiscountPercentage(
                  product.product?.productItems[0]?.price,
                  product.product?.productItems[0]?.productDiscount?.value || 0
                )}
                %
              </Typography>
            </VerticalDiscountBadge>
          </div>
        )}
        {/* Image */}
        <div
          className={`${isMobile ? 'h-[114px]' : 'h-[142px]'}
              aspect-square flex items-center justify-center bg-white/10 rounded-lg`}
        >
          {product.product?.productImages[0]?.imageUpload?.url &&
          product.product?.productImages[0]?.imageUpload?.url !== '' ? (
            <Image
              src={product.product?.productImages[0]?.imageUpload?.url}
              alt="default-image"
              width={0}
              height={0}
              className={`object-contain object-center aspect-square
              w-auto h-auto rounded-lg`}
              onError={(e) => {
                const currentImg = e.currentTarget as HTMLImageElement;
                currentImg.src = '/assets/default-image.png';
                currentImg.className = `object-contain object-center
               h-auto rounded-lg w-[50%]`;
              }}
            />
          ) : (
            <Image
              src="/assets/default-image.png"
              alt="default-image"
              width={0}
              height={0}
              className={`object-contain ${
                isMobile ? 'w-[3.75rem]' : 'w-[4.5rem]'
              }`}
            />
          )}
        </div>
        {/* Details */}
        <div className="flex flex-col justify-between w-full">
          <Typography
            variant={isMobile ? 'h6' : 'h5'}
            className={`!line-clamp-2 !font-bold ${
              isExpired ? '!text-text-quinary' : '!text-text-secondary'
            }`}
          >
            {product.product?.name}
          </Typography>
          {/* Label */}
          {isExpired && (
            <div className="flex items-center gap-2 my-2">
              <Label
                text="โปรโมชั่นหมดอายุ"
                variant="ghost"
                rounding="pill"
                color="neutral"
                size={isMobile ? 'small' : 'middle'}
              />
            </div>
          )}
          {/* Prices */}
          <div className="flex items-center justify-between flex-wrap">
            <div className="flex items-center gap flex-wrap">
              <Typography
                variant={isMobile ? 'h5' : 'h3'}
                className={`${
                  isExpired ? '!text-text-disabled' : '!text-primary'
                } !font-bold !line-clamp-1 !h-fit !pr-2`}
              >
                {formatThaiBaht(
                  product.product?.productItems[0]?.productDiscount?.value
                )}
              </Typography>
              <Typography
                variant={isMobile ? 'paragraph-medium' : 'paragraph-small'}
                className={`!line-through  !line-clamp-1 ${
                  isMobile ? '!text-[14px]' : ''
                } ${isExpired ? '!text-text-disabled' : '!text-text-quinary'}`}
              >
                {formatThaiBaht(product.product?.productItems[0]?.price)}
              </Typography>
            </div>
            <Typography
              variant="paragraph-small"
              className={`${
                isExpired ? '!text-text-disabled' : '!text-text-quarternary'
              } !font-normal`}
            >
              {`ขายแล้ว ${product.product?.soldQuantity || 0} ${
                product.product?.bigUnit || product.product?.unit || 'ชิ้น'
              }`}
            </Typography>
          </div>
        </div>
      </div>
    </Link>
  );
}
