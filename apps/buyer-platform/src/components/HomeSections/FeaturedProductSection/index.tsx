'use client';
import { getMerchantFeaturedProducts } from '@/common/api/product-service/product.api';
import { FeaturedProductType } from '@/common/enum/FeaturedProductTypes';
import { IProduct } from '@/common/interfaces/product.interface';
import { useQuery } from '@tanstack/react-query';
import { Grid } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import CardProduct from '../../Card/Product';
import CustomTypography from '../../Typography';
import Buttons from './Buttons';
import './custom.css';

type FeaturedProducts = {
  recommended: IProduct[];
  new: IProduct[];
  discount: IProduct[];
};

interface Props {
  slug: string;
}

const resolveFeaturedProductType = (featuredProducts: FeaturedProducts) => {
  if (featuredProducts.recommended.length > 0) {
    return FeaturedProductType.RECOMMENDED;
  } else if (featuredProducts.new.length > 0) {
    return FeaturedProductType.NEW;
  } else if (featuredProducts.discount.length > 0) {
    return FeaturedProductType.PROMOTION;
  }
  return FeaturedProductType.RECOMMENDED;
};

const FeaturedProductSection = ({ slug }: Props) => {
  const [featuredProductType, setFeaturedProductType] = useState(
    FeaturedProductType.RECOMMENDED
  );

  const { data: featuredProductsQuery, error: errorFeaturedProducts } =
    useQuery({
      queryKey: ['featuredProducts', slug],
      queryFn: () => getMerchantFeaturedProducts(slug),
      enabled: !!slug,
    });

  const featuredProducts: FeaturedProducts = useMemo(
    () =>
      featuredProductsQuery || {
        recommended: [],
        new: [],
        discount: [],
      },
    [featuredProductsQuery]
  );

  useEffect(() => {
    setFeaturedProductType(resolveFeaturedProductType(featuredProducts));
  }, [featuredProducts]);

  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;

  const hasFeatureProducts =
    featuredProducts?.recommended.length > 0 ||
    featuredProducts?.new.length > 0 ||
    featuredProducts?.discount.length > 0;

  if (!hasFeatureProducts || errorFeaturedProducts) {
    return null;
  }

  return (
    <div className="flex flex-col pt-8 pb-8 gap-5 w-full bg-background-primary">
      <div className="container mx-auto">
        <div className="flex items-center gap-[.5rem]">
          <CustomTypography
            variant={isMobile ? 'h2' : 'h3'}
            className="!ml-[1rem] md:!ml-[2rem]"
          >
            สินค้า
          </CustomTypography>
          <CustomTypography
            variant={isMobile ? 'h2' : 'h3'}
            className="!text-primary !mt-0"
          >
            {featuredProductType}
          </CustomTypography>
        </div>
        <div className={` ${isMobile ? '!ml-[1rem] my-3' : '!ml-[2rem] my-5'}`}>
          <Buttons
            featuredProducts={featuredProducts}
            setFeaturedProductType={setFeaturedProductType}
            featuredProductType={featuredProductType}
          />
        </div>
        <div className="grid grid-cols-2 min-[600px]:grid-cols-3 min-[1024px]:grid-cols-4 min-[1300px]:grid-cols-5 md:gap-8 gap-3 md:px-8 px-3">
          {featuredProductType === FeaturedProductType.RECOMMENDED &&
            featuredProducts?.recommended?.map((product) => (
              <CardProduct key={product.id} product={product} />
            ))}
          {featuredProductType === FeaturedProductType.NEW &&
            featuredProducts?.new?.map((product) => (
              <CardProduct key={product.id} product={product} />
            ))}
          {featuredProductType === FeaturedProductType.PROMOTION &&
            featuredProducts?.discount?.map((product) => (
              <CardProduct key={product.id} product={product} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedProductSection;
