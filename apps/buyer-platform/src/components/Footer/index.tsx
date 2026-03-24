'use client';
import { getMerchantDetails } from '@/common/api/customer-service/merchant.api';
import { IMerchant } from '@/common/interfaces/MerchantInfo.interface';
import { useScreenWidth } from '@/hooks/useScreenWidth';
import { useQuery } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import CustomButton from '../Button';
import FeatureIcon from '../Icon/FeatureIcon';
import Typography from '../Typography';

interface Props {
  slug: string;
}

export default function Footer({ slug }: Props) {
  const { data, error } = useQuery({
    queryKey: ['merchantDetails', slug],
    queryFn: () => getMerchantDetails(slug),
  });

  const pathname = usePathname();
  const xl = useScreenWidth() >= 1280;
  const md = useScreenWidth() >= 768;

  const isProductPage = pathname.includes('/product') && !md;
  const isCartPage = pathname.includes('/cart') && !xl;
  const isVerifyKycPage = pathname.includes('/verify-kyc');

  const merchant: IMerchant = data?.data || null;

  if (!merchant || error || isVerifyKycPage) {
    return null;
  }

  return (
    <div
      className={`flex flex-col ${isCartPage ? 'pb-[120px]' : ''}  ${
        isProductPage ? 'pb-[168px]' : ''
      }`}
    >
      <div className="!bg-background-primary py-[2rem]">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-8 gap-[2rem] lg:gap-0 px-3 lg:px-5">
          {/* first column */}
          <div className="flex flex-col items-start gap-1 lg:col-span-3">
            <Image
              src={merchant.merchantLogo?.imageUpload?.url}
              alt={merchant.name}
              width={0}
              height={0}
              className="object-contain w-auto max-h-[4rem]"
              onError={(e) => {
                const currentImg = e.currentTarget as HTMLImageElement;
                currentImg.className = `hidden`;
              }}
            />
            <Typography
              variant="paragraph-medium"
              className="!text-text-tertiary"
            >
              {merchant?.highlight}
            </Typography>
          </div>
          {/* second column */}
          <div className="flex w-full justify-between lg:justify-start lg:gap-1 lg:col-span-2">
            <div className="flex flex-col gap-1 flex-1">
              <Typography
                variant="paragraph-medium"
                className="!text-text-quinary"
              >
                บริการ
              </Typography>
              <Link href="/">
                <Typography
                  variant="paragraph-medium"
                  className="!text-text-secondary hover:!text-primary !w-fit !cursor-pointer"
                >
                  หน้าหลัก
                </Typography>
              </Link>
              <Typography
                variant="paragraph-medium"
                className="!text-text-secondary hover:!text-primary !w-fit !cursor-pointer"
              >
                สินค้า
              </Typography>
              <Typography
                variant="paragraph-medium"
                className="!text-text-secondary hover:!text-primary !w-fit !cursor-pointer"
              >
                บทความ
              </Typography>
              <Typography
                variant="paragraph-medium"
                className="!text-text-secondary hover:!text-primary !w-fit !cursor-pointer"
              >
                สินค้าโปรโมชั่น
              </Typography>
            </div>
            {/* third column */}
            <div className="flex flex-col gap-1 flex-1">
              <Typography
                variant="paragraph-medium"
                className="!text-text-quinary"
              >
                {merchant?.name}
              </Typography>
              <Typography
                variant="paragraph-medium"
                className="!text-text-secondary hover:!text-primary !w-fit !cursor-pointer"
              >
                เกี่ยวกับเรา
              </Typography>
              <Typography
                variant="paragraph-medium"
                className="!text-text-secondary hover:!text-primary !w-fit !cursor-pointer"
              >
                ติดต่อเรา
              </Typography>
            </div>
          </div>
          {/* fourth column */}
          <div className="flex w-full flex-col gap-1 lg:col-span-1">
            <Typography
              variant="paragraph-medium"
              className="!text-text-quinary"
            >
              นโยบาย
            </Typography>
            <Typography
              variant="paragraph-medium"
              className="!text-text-secondary hover:!text-primary !w-fit !cursor-pointer"
            >
              การใช้บริการ
            </Typography>
            <Typography
              variant="paragraph-medium"
              className="!text-text-secondary hover:!text-primary !w-fit !cursor-pointer"
            >
              ความเป็นส่วนตัว
            </Typography>
            <Typography
              variant="paragraph-medium"
              className="!text-text-secondary hover:!text-primary !w-fit !cursor-pointer"
            >
              การใช้คุกกี้
            </Typography>
          </div>
          {/* fifth column */}
          <div className="flex flex-col gap-3 lg:col-span-2">
            <Typography
              variant="paragraph-medium"
              className="!text-text-quinary"
            >
              Contact
            </Typography>
            <div className="flex gap-3 items-start">
              <FeatureIcon
                icon={<i className="ri-map-pin-line"></i>}
                size="sm"
                color="primary"
              />
              <Typography
                variant="paragraph-medium"
                className="!text-text-secondary hover:!text-primary !w-fit"
              >
                {merchant?.contactAddress}
              </Typography>
            </div>
            <div className="flex gap-3 items-start">
              <FeatureIcon
                icon={<i className="ri-phone-line"></i>}
                size="sm"
                color="primary"
              />
              <Link href={`tel:${merchant?.tel}`}>
                <Typography
                  variant="paragraph-medium"
                  className="!text-text-secondary hover:!text-primary w-fit"
                >
                  {merchant?.tel}
                </Typography>
              </Link>
            </div>
            <div className="flex gap-3 items-start">
              <FeatureIcon
                icon={<i className="ri-mail-line"></i>}
                size="sm"
                color="primary"
              />
              <Typography
                variant="paragraph-medium"
                className="!text-text-secondary hover:!text-primary !w-fit"
              >
                {merchant?.email}
              </Typography>
            </div>
          </div>
        </div>
      </div>

      {/* second row */}
      <div className="!bg-background-secondary py-5">
        <div className="container mx-auto grid grid-cols-1 gap-3 lg:gap-0 justify-center lg:justify-between lg:grid-cols-3 items-center">
          <div className="flex justify-center lg:justify-start order-2 lg:order-1">
            <Typography
              variant="paragraph-extra-small"
              className="!text-text-quarternary"
            >
              © 2025 AllKons All Rights Reserved
            </Typography>
          </div>
          <div className="flex gap-4 justify-center order-3 lg:order-2">
            <Typography
              variant="paragraph-extra-small"
              className="!text-text-quarternary !cursor-pointer !w-fit"
            >
              นโยบายความเป็นส่วนตัว
            </Typography>
            <Typography
              variant="paragraph-extra-small"
              className="!text-text-quarternary !cursor-pointer !w-fit"
            >
              เงื่อนไขการใช้บริการ
            </Typography>
          </div>
          <div className="flex gap-2 justify-center lg:justify-end px-3 lg:px-5 order-1 lg:order-3">
            <CustomButton
              icon={<i className="ri-facebook-fill"></i>}
              variant="outlined"
              color="neutral"
            ></CustomButton>
            <CustomButton
              icon={<i className="ri-youtube-fill"></i>}
              variant="outlined"
              color="neutral"
            ></CustomButton>
            <CustomButton
              icon={<i className="ri-instagram-fill"></i>}
              variant="outlined"
              color="neutral"
            ></CustomButton>
            <CustomButton
              icon={<i className="ri-line-fill"></i>}
              variant="outlined"
              color="neutral"
            ></CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
}
