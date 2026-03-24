'use client';
import { getProductCatalogs } from '@/common/api/product-service/product.api';
import { IProductCatalog } from '@/common/interfaces/ProductCatalog.interface';
import { useQuery } from '@tanstack/react-query';
import { Grid } from 'antd';
import Slider, { Settings } from 'react-slick';
import CatalogCard from '../../Card/Catalog';
import { BorderedNextArrow, BorderedPrevArrow } from '../../Carousel';
import Typography from '../../Typography';
import './custom.css';

interface Props {
  slug: string;
}

export default function CatalogSection({ slug }: Props) {
  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;

  const { data: catalogsQuery, error: errorCatalogs } = useQuery({
    queryKey: ['productCatalogs', slug],
    queryFn: () => getProductCatalogs(slug),
    enabled: !!slug,
  });

  const catalogs: IProductCatalog[] = catalogsQuery?.data || [];

  const settings: Settings = {
    infinite: true,
    speed: 500,
    slidesToShow: catalogs.length < 6 ? catalogs.length : 6,
    swipeToSlide: true,
    arrows: true,
    prevArrow: <BorderedPrevArrow isMobile={isMobile} />,
    nextArrow: <BorderedNextArrow isMobile={isMobile} />,
    vertical: false,
    responsive: [
      {
        breakpoint: 480,
        settings: {
          slidesToShow: catalogs.length < 2 ? catalogs.length : 2,
          swipeToSlide: true,
          prevArrow: <BorderedPrevArrow isMobile={isMobile} />,
          nextArrow: <BorderedNextArrow isMobile={isMobile} />,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: catalogs.length < 2 ? catalogs.length : 2,
          swipeToSlide: true,
          prevArrow: <BorderedPrevArrow isMobile={isMobile} />,
          nextArrow: <BorderedNextArrow isMobile={isMobile} />,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: catalogs.length < 3 ? catalogs.length : 3,
          infinite: true,
          swipeToSlide: true,
          prevArrow: <BorderedPrevArrow isMobile={isMobile} />,
          nextArrow: <BorderedNextArrow isMobile={isMobile} />,
        },
      },
      {
        breakpoint: 1300,
        settings: {
          slidesToShow: catalogs.length < 4 ? catalogs.length : 4,
          infinite: true,
          swipeToSlide: true,
          prevArrow: <BorderedPrevArrow isMobile={isMobile} />,
          nextArrow: <BorderedNextArrow isMobile={isMobile} />,
        },
      },
    ],
  };

  if (catalogs.length < 1 || errorCatalogs) {
    return null;
  }

  return (
    <div
      className={`bg-background-secondary ${
        isMobile ? 'py-[2rem]' : 'py-[3rem]'
      }`}
    >
      <div className="slider-container">
        <Typography
          variant={isMobile ? 'h2' : 'h3'}
          className="!ml-[1rem] md:!ml-[1.2rem]"
        >
          หมวดหมู่ที่คุณอาจสนใจ
        </Typography>
        <Slider
          {...settings}
          className={`catalog ${isMobile ? 'mt-6' : 'mt-[1.5rem]'}`}
        >
          {catalogs.map((catalog) => (
            <CatalogCard key={catalog.id} catalog={catalog} />
          ))}
        </Slider>
      </div>
    </div>
  );
}
