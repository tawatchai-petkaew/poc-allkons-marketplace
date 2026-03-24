'use client';

import { getMerchantBanners } from '@/common/api/customer-service/merchant.api';
import { IBanner } from '@/common/interfaces/Banner.interface';
import { useQuery } from '@tanstack/react-query';
import { Grid } from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Slider, { Settings } from 'react-slick';
import { NextArrow, PrevArrow } from '../../Carousel';
import './custom.css';

type Props = {
  slug: string;
};

const BannerSection = ({ slug }: Props) => {
  const { data: bannersQuery, error: errorBanner } = useQuery({
    queryKey: ['merchantData', slug],
    queryFn: () => getMerchantBanners(slug),
    enabled: !!slug,
  });

  const banners: IBanner[] = bannersQuery?.data || [];

  const { useBreakpoint } = Grid;

  const screen = useBreakpoint();
  const isMobile = !screen.sm;

  const [sliderKey, setSliderKey] = useState(0);

  useEffect(() => {
    if (isMobile) {
      setSliderKey((prev) => prev + 1);
    } else if (!isMobile) {
      setSliderKey((prev) => prev + 1);
    }
  }, [isMobile]);

  const settings: Settings = {
    dots: banners.length > 1,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: banners.length > 1,
    centerMode: true,
    centerPadding: '0',
    adaptiveHeight: true,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: true,
          prevArrow: undefined,
          nextArrow: undefined,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          prevArrow: undefined,
          nextArrow: undefined,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          prevArrow: undefined,
          nextArrow: undefined,
        },
      },
    ],
  };

  if (banners.length < 1 || errorBanner) {
    return null;
  }

  return (
    <div className="overflow-hidden">
      <Slider key={sliderKey} {...settings} className="banner !cursor-pointer">
        {!isMobile
          ? banners.map((banner) => (
              <div
                key={banner.id}
                className="flex items-center justify-center !outline-none"
              >
                <Link
                  href={banner?.url || ''}
                  target={banner.isOpenNewWindow ? '_blank' : '_self'}
                  className="outline-none"
                >
                  <Image
                    src={banner.bannerMerchantDesktop?.imageUpload?.url}
                    alt="banner"
                    width={0}
                    height={0}
                    priority={true}
                    className={`object-cover 2xl:object-contain object-center h-auto max-h-[720px] w-screen`}
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.src = '/assets/default-image.png';
                      img.className = '!w-[624px] !h-[500px] mx-auto';
                    }}
                  />
                </Link>
              </div>
            ))
          : banners.map((banner) => (
              <div
                key={banner.id}
                className="outline-none flex justify-center items-center"
              >
                <Link
                  href={banner?.url || ''}
                  target={banner.isOpenNewWindow ? '_blank' : '_self'}
                >
                  <Image
                    src={banner.bannerMerchantApplication?.imageUpload.url}
                    alt="banner"
                    width={0}
                    height={0}
                    priority={true}
                    className={`w-screen h-auto max-h-[720px] object-cover object-center`}
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.src = '/assets/default-image.png';
                      img.className = 'mx-auto !w-[224px] !h-[180px]';
                    }}
                  />
                </Link>
              </div>
            ))}
      </Slider>
    </div>
  );
};

export default BannerSection;
