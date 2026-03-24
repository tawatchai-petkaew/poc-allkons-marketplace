'use client';

import { getMerchantBestSellers } from '@/common/api/product-service/product.api';
import { IProduct } from '@/common/interfaces/product.interface';
import { useQuery } from '@tanstack/react-query';
import { Grid } from 'antd';
import Slider, { Settings } from 'react-slick';
import CardProduct from '../../Card/Product';
import { BorderedNextArrow, BorderedPrevArrow } from '../../Carousel';
import CustomTypography from '../../Typography';
import './custom.css';

interface Props {
  slug: string;
}

const BestSellerSection = ({ slug }: Props) => {
  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;

  const { data: bestSellersQuery, error: errorBestSellers } = useQuery({
    queryKey: ['bestSellers', slug],
    queryFn: () => getMerchantBestSellers(slug),
    enabled: !!slug,
  });

  const bestSellers: IProduct[] = bestSellersQuery?.data || [];

  const sortedBestSellers: IProduct[] =
    bestSellersQuery?.data?.sort((a: IProduct, b: IProduct) => {
      let result = b.soldQuantity - a.soldQuantity;

      if (a.soldQuantity === b.soldQuantity) {
        result =
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        if (a.updatedAt === b.updatedAt) {
          result =
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      }
      return result;
    }) || [];

  const settings: Settings = {
    infinite: true,
    speed: 500,
    slidesToShow: bestSellers.length < 5 ? bestSellers.length : 5,
    slidesToScroll: bestSellers.length < 5 ? bestSellers.length : 5,
    arrows: true,
    prevArrow: <BorderedPrevArrow isMobile={isMobile} />,
    nextArrow: <BorderedNextArrow isMobile={isMobile} />,
    vertical: false,
    responsive: [
      {
        breakpoint: 480,
        settings: {
          slidesToShow: bestSellers.length < 2 ? bestSellers.length : 2,
          slidesToScroll: bestSellers.length < 2 ? bestSellers.length : 2,
          prevArrow: <BorderedPrevArrow isMobile={isMobile} />,
          nextArrow: <BorderedNextArrow isMobile={isMobile} />,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: bestSellers.length < 2 ? bestSellers.length : 2,
          slidesToScroll: bestSellers.length < 2 ? bestSellers.length : 2,
          prevArrow: <BorderedPrevArrow isMobile={isMobile} />,
          nextArrow: <BorderedNextArrow isMobile={isMobile} />,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: bestSellers.length < 3 ? bestSellers.length : 3,
          slidesToScroll: bestSellers.length < 3 ? bestSellers.length : 3,
          infinite: true,
          prevArrow: <BorderedPrevArrow isMobile={isMobile} />,
          nextArrow: <BorderedNextArrow isMobile={isMobile} />,
        },
      },
      {
        breakpoint: 1300,
        settings: {
          slidesToShow: bestSellers.length < 4 ? bestSellers.length : 4,
          slidesToScroll: bestSellers.length < 4 ? bestSellers.length : 4,
          infinite: true,
          prevArrow: <BorderedPrevArrow isMobile={isMobile} />,
          nextArrow: <BorderedNextArrow isMobile={isMobile} />,
        },
      },
    ],
  };

  if (bestSellers.length < 1 || errorBestSellers) {
    return null;
  }

  return (
    <div className="flex flex-col py-[2rem] gap-5 w-full bg-background-secondary">
      <div className="container mx-auto">
        <CustomTypography
          variant={isMobile ? 'h2' : 'h3'}
          className="!ml-[1rem] md:!ml-[2rem]"
        >
          สินค้ายอดนิยม
        </CustomTypography>
        <div className="mt-5">
          <Slider {...settings} className="best-seller">
            {sortedBestSellers.map((product) => (
              <div key={product.name} className="h-full">
                <CardProduct product={product} />
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </div>
  );
};

export default BestSellerSection;
