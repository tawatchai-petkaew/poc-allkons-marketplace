import { FeaturedProductType } from '@/common/enum/FeaturedProductTypes';
import { IProduct } from '@/common/interfaces/product.interface';
import TabButton from '@/components/Button/TabButton';

interface Props {
  featuredProductType: FeaturedProductType;
  featuredProducts: {
    recommended: IProduct[];
    new: IProduct[];
    discount: IProduct[];
  };
  setFeaturedProductType: (productType: FeaturedProductType) => void;
}

export default function Buttons({
  featuredProductType,
  featuredProducts,
  setFeaturedProductType,
}: Props) {
  return (
    <div className="flex gap-2">
      {featuredProducts?.recommended.length > 0 && (
        <TabButton
          active={featuredProductType === FeaturedProductType.RECOMMENDED}
          onClick={() =>
            setFeaturedProductType(FeaturedProductType.RECOMMENDED)
          }
          icon={<i className="ri-thumb-up-line"></i>}
        >
          แนะนำ
        </TabButton>
      )}
      {featuredProducts?.new.length > 0 && (
        <TabButton
          active={featuredProductType === FeaturedProductType.NEW}
          onClick={() => setFeaturedProductType(FeaturedProductType.NEW)}
          icon={<i className="ri-shopping-bag-3-line"></i>}
        >
          มาใหม่
        </TabButton>
      )}
      {featuredProducts?.discount.length > 0 && (
        <TabButton
          active={featuredProductType === FeaturedProductType.PROMOTION}
          onClick={() => setFeaturedProductType(FeaturedProductType.PROMOTION)}
          icon={<i className="ri-price-tag-3-line"></i>}
        >
          โปรโมชั่น
        </TabButton>
      )}
    </div>
  );
}
