'use client';

import { IProductCategory } from '@/common/interfaces/ProductCatagory.interface';
import { useCategoryData } from '@/hooks/useCategoryData';
import { Grid } from 'antd';
import { FC } from 'react';
import Slider, { Settings } from 'react-slick';
import CategoryCard from '../../Card/Category';
import { BorderedNextArrow, BorderedPrevArrow } from '../../Carousel';
import CustomTypography from '../../Typography';
import CategorySectionSkeleton from '@/components/Skeletions/CategorySection';

const CategorySection: FC = () => {
  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;

  const { data, error, isPending, isLoading } = useCategoryData();

  const categories: IProductCategory[] = data?.data || [];

  const settings: Settings = {
    infinite: categories?.length > 8,
    speed: 500,
    slidesToShow: 8,
    slidesToScroll: 8,
    arrows: categories?.length > 8,
    prevArrow: <BorderedPrevArrow isMobile={isMobile} />,
    nextArrow: <BorderedNextArrow isMobile={isMobile} />,
    adaptiveHeight: true,
    vertical: false,
    responsive: [
      {
        breakpoint: 1536,
        settings: {
          slidesToShow: 7,
          slidesToScroll: 7,
          infinite: categories?.length > 7,
          arrows: categories?.length > 7,
          prevArrow: <BorderedPrevArrow isMobile={isMobile} />,
          nextArrow: <BorderedNextArrow isMobile={isMobile} />,
        },
      },
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 6,
          slidesToScroll: 6,
          infinite: categories?.length > 6,
          arrows: categories?.length > 6,
          prevArrow: <BorderedPrevArrow isMobile={isMobile} />,
          nextArrow: <BorderedNextArrow isMobile={isMobile} />,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 4,
          infinite: categories?.length > 4,
          arrows: categories?.length > 4,
          prevArrow: <BorderedPrevArrow isMobile={isMobile} />,
          nextArrow: <BorderedNextArrow isMobile={isMobile} />,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 4,
          infinite: categories?.length > 4,
          arrows: categories?.length > 4,
          prevArrow: <BorderedPrevArrow isMobile={isMobile} />,
          nextArrow: <BorderedNextArrow isMobile={isMobile} />,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 4,
          arrows: categories?.length > 4,
          infinite: categories?.length > 4,
          prevArrow: <BorderedPrevArrow isMobile={isMobile} />,
          nextArrow: <BorderedNextArrow isMobile={isMobile} />,
        },
      },
    ],
  };

  if (categories?.length < 1 || error) {
    return null;
  }

  return (
    <div className="container mx-auto">
      {isLoading && isPending ? (
        <CategorySectionSkeleton />
      ) : (
        <div className="flex flex-col gap-5 pt-6 pb-6">
          <CustomTypography
            variant={isMobile ? 'h2' : 'h3'}
            className="!ml-[1rem] md:!ml-[2rem]"
          >
            หมวดหมู่สินค้า
          </CustomTypography>
          <div className="md:!px-5 !px-1">
            <Slider {...settings} className="[&_.slick-track]:!ml-0">
              {categories.map((item: IProductCategory) => (
                <div key={item.id}>
                  <CategoryCard category={item} />
                </div>
              ))}
            </Slider>
          </div>
        </div>
      )}
    </div>
  );
};
export default CategorySection;
