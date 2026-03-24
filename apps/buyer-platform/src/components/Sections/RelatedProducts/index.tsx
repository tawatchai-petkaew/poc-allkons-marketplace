'use client';

import { IProduct } from '@/common/interfaces/product.interface';
import { Grid } from 'antd';
import Slider, { Settings } from 'react-slick';
import CardProduct from '../../Card/Product';
import { BorderedNextArrow, BorderedPrevArrow } from '../../Carousel';
import CustomTypography from '../../Typography';
import './custom.css';

interface Props {
  relatedProducts: IProduct[];
}

const RelatedProductSection = ({ relatedProducts }: Props) => {
  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;

  const settings: Settings = {
    infinite: relatedProducts.length > 5,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 5,
    adaptiveHeight: true,
    arrows: relatedProducts.length > 5,
    prevArrow: <BorderedPrevArrow isMobile={isMobile} />,
    nextArrow: <BorderedNextArrow isMobile={isMobile} />,
    responsive: [
      {
        breakpoint: 1300,
        settings: {
          infinite: relatedProducts.length > 4,
          slidesToShow: 4,
          slidesToScroll: 4,
          arrows: relatedProducts.length > 4,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          infinite: relatedProducts.length > 3,
          slidesToShow: 3,
          slidesToScroll: 3,
          arrows: relatedProducts.length > 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          infinite: relatedProducts.length > 2,
          slidesToShow: 2,
          slidesToScroll: 2,
          arrows: relatedProducts.length > 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          infinite: relatedProducts.length > 2,
          slidesToShow: 2,
          slidesToScroll: 2,
          arrows: relatedProducts.length > 2,
        },
      },
    ].map((breakpoint) => ({
      ...breakpoint,
      settings: {
        ...breakpoint.settings,
        prevArrow: <BorderedPrevArrow isMobile={isMobile} />,
        nextArrow: <BorderedNextArrow isMobile={isMobile} />,
      },
    })),
  };

  if (relatedProducts.length === 0) return null;

  return (
    <div className="flex flex-col mb-6 md:mb-[3rem] gap-5 w-full bg-background-secondary">
      <div className="container mx-auto">
        <CustomTypography
          variant={isMobile ? 'h2' : 'h3'}
          className="!ml-[1rem] md:!ml-[0rem]"
        >
          สินค้าที่เกี่ยวข้อง
        </CustomTypography>
        <div className="mt-5 pr-1 md:px-0 !flex related-product">
          <Slider {...settings} className="related-product">
            {relatedProducts.map((product) => (
              <div key={product.id} className="h-full">
                <CardProduct product={product} />
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </div>
  );
};

export default RelatedProductSection;
