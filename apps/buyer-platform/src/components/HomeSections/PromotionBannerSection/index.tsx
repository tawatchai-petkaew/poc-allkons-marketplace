'use client';

import { getPromotionBanner } from '@/common/api/customer-service/merchant.api';
import { IPromotionBanner } from '@/common/interfaces/PromotionBanner.interface';
import { useScreenWidth } from '@/hooks/useScreenWidth';
import { useQuery } from '@tanstack/react-query';
import { Grid } from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import Slider, { Settings } from 'react-slick';
import { NextArrow, PrevArrow } from '../../Carousel';
import './custom.css';

interface Props {
  slug: string;
}

export default function PromotionBannerSection({ slug }: Props) {
  const { data: bannersQuery, error: errorBanners } = useQuery({
    queryKey: ['promotionBanners', slug],
    queryFn: () => getPromotionBanner(slug),
    enabled: !!slug,
  });

  const banners: IPromotionBanner[] = bannersQuery?.data || [];

  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;
  const screenWidth = useScreenWidth();
  const sliderRef = useRef<Slider>(null);

  const desktopSettings: Settings = {
    centerPadding:
      screenWidth >= 1536
        ? '390px'
        : screenWidth >= 1280
        ? '260px'
        : screenWidth >= 1024
        ? '132px'
        : '0px',
    centerMode: true,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    speed: 500,
    arrows: false,
    nextArrow: (
      <NextArrow customStyles="absolute right-[20%] top-1/2 z-100 -translate-y-1/2 lg:flex" />
    ),
    prevArrow: (
      <PrevArrow customStyles="absolute left-[20%] top-1/2 z-100 -translate-y-1/2 lg:flex" />
    ),
    dots: true,
    adaptiveHeight: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          centerMode: false,
          arrows: false,
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const mobileSettings: Settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    adaptiveHeight: true,
  };

  const handleNext = () => {
    setTimeout(() => {
      sliderRef.current?.slickNext();
    }, 200);
  };

  const handlePrev = () => {
    setTimeout(() => {
      sliderRef.current?.slickPrev();
    }, 200);
  };

  if (banners.length === 0 || errorBanners) {
    return null;
  }

  return (
    <div className="container relative mx-auto py-[2rem] overflow-hidden">
      {!isMobile && (
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 z-10 flex w-[800px]">
          <NextArrow
            customStyles="absolute right-0 top-1/2 z-10 -translate-y-1/2 lg:flex"
            onClick={handleNext}
          />
          <PrevArrow
            customStyles="absolute left-0 top-1/2 z-10 -translate-y-1/2 lg:flex"
            onClick={handlePrev}
          />
        </div>
      )}
      <div className="hidden md:block">
        <Slider
          {...desktopSettings}
          className="desktop-promotion-banner !relative"
          ref={sliderRef}
        >
          {banners?.map((banner) => (
            <div
              key={banner.id}
              className="relative !flex !items-center !justify-center h-[336px] min-w-[672px] !outline-none"
            >
              {banner?.url && banner.url !== '' ? (
                <Link
                  href={banner?.url}
                  target={banner.isOpenNewWindow ? '_blank' : '_self'}
                  className="!outline-none"
                >
                  <Image
                    src={banner?.imageUpload?.url}
                    alt={`Promotion banner ${banner.id}`}
                    width={0}
                    height={0}
                    priority={true}
                    className={`object-cover object-center max-h-[336px] w-[672px] rounded-2xl `}
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.src = '/assets/default-image.png';
                      img.className = '!w-[218px] !h-[174px] mx-auto';
                    }}
                  />
                </Link>
              ) : (
                <Image
                  src={banner?.imageUpload?.url}
                  alt={`Promotion banner ${banner.id}`}
                  width={0}
                  height={0}
                  priority={true}
                  className={`object-cover object-center max-h-[336px] w-[672px] rounded-2xl `}
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src = '/assets/default-image.png';
                    img.className = '!w-[218px] !h-[174px] mx-auto';
                  }}
                />
              )}
            </div>
          ))}
        </Slider>
      </div>
      <div className="block md:hidden">
        <Slider {...mobileSettings} className="mobile-promotion-banner">
          {banners?.map((banner) => (
            <div
              key={banner.id}
              className="!flex !items-center !justify-center min-h-[200px] min-w-full px-3 !outline-none"
            >
              {banner?.url && banner.url !== '' ? (
                <Link
                  href={banner?.url}
                  target={banner?.isOpenNewWindow ? '_blank' : '_self'}
                  className="outline-none"
                >
                  <Image
                    src={banner?.imageUpload?.url}
                    alt={`Promotion banner ${banner.id}`}
                    width={0}
                    height={0}
                    priority={true}
                    className={`object-cover object-center h-auto w-auto rounded-xl`}
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.src = '/assets/default-image.png';
                      img.className = '!w-[112px] !h-[90px] mx-auto';
                    }}
                  />
                </Link>
              ) : (
                <Image
                  src={banner?.imageUpload?.url}
                  alt={`Promotion banner ${banner.id}`}
                  width={0}
                  height={0}
                  priority={true}
                  className={`object-cover object-center h-auto w-auto rounded-xl`}
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src = '/assets/default-image.png';
                    img.className = '!w-[112px] !h-[90px] mx-auto';
                  }}
                />
              )}
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}
