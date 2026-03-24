'use client';

import { formatThaiBaht, getSoldDisplay } from '@/utils/format';
import { Drawer, Grid, Input } from 'antd';
import { useEffect, useState } from 'react';
import CustomButton from '../../Button';
import ProductVariantButton from '../../Button/ProductVariant';
import Typography from '../../Typography';
import './custom.css';
import { IProductItem } from '@/common/interfaces/product.interface';

interface Props {
  open: boolean;
  onClose: () => void;
  setActiveVariant: (variant: IProductItem | null) => void;
  variantList: IProductItem[];
  activeVariant?: IProductItem | null;
  variantType: string;
  productName: string;
}

const ProductVariantDrawer = ({
  open,
  onClose,
  setActiveVariant,
  variantList,
  activeVariant,
  variantType,
  productName,
}: Props) => {
  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;

  const [currentActiveVariant, setCurrentActiveVariant] =
    useState<IProductItem | null>(null);
  const [searchInput, setSearchInput] = useState<string>('');

  useEffect(() => {
    if (activeVariant) {
      setCurrentActiveVariant(activeVariant);
    } else {
      setCurrentActiveVariant(null);
    }
  }, [activeVariant]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const filteredVariantList =
    searchInput?.trim().length > 0
      ? variantList.filter((variant) => {
          return variant.primaryOptionsValue?.includes(
            searchInput.toLowerCase()
          );
        })
      : variantList;

  return (
    <div className="custom-drawer product-variant-drawer">
      <Drawer
        title={
          <div>
            <Typography variant="h4" className="!text-text-primary">
              {`เลือก${variantType}`}
            </Typography>
            <Typography
              variant="paragraph-medium"
              className="!text-text-tertiary"
            >
              {productName}
            </Typography>
          </div>
        }
        closable={{ 'aria-label': 'Close Button' }}
        onClose={() => {
          onClose();
          setSearchInput('');
        }}
        open={open}
        placement={isMobile ? 'bottom' : 'right'}
        className={`custom-drawer !relative ${
          isMobile ? '!px-4 rounded-2xl' : '!px-6'
        }`}
        width={432}
        height={isMobile ? '95%' : 'auto'}
      >
        <Input
          size="large"
          placeholder="ค้นหา"
          prefix={<i className="ri-search-line text-text-quarternary"></i>}
          onChange={handleSearch}
          value={searchInput}
        />
        <Typography
          variant={isMobile ? 'paragraph-medium' : 'paragraph-big'}
          className={`!text-text-secondary ${isMobile ? '!mt-4' : '!mt-6'}`}
        >
          {`${variantType} (${filteredVariantList.length} รายการ)`}
        </Typography>
        <div
          className={`flex flex-wrap  mt-2 overflow-y-scroll ${
            isMobile ? 'max-h-[48vh] gap-1' : 'max-h-[50vh] gap-3'
          }`}
        >
          {filteredVariantList.map((variant, index) => (
            <div key={index}>
              <ProductVariantButton
                onClick={() => {
                  if (variant === currentActiveVariant) {
                    setCurrentActiveVariant({} as IProductItem);
                    return;
                  }
                  setCurrentActiveVariant(variant);
                }}
                isActive={variant === currentActiveVariant}
              >
                {variant.primaryOptionsValue}
              </ProductVariantButton>
            </div>
          ))}
        </div>
        <div
          className={`bg-background-primary border border-border-primary fixed z-10 bottom-0 right-0 flex flex-col items-center ${
            isMobile ? 'w-full p-4 gap-3' : 'w-[432px] p-6 gap-6'
          }`}
        >
          <div className="flex w-full justify-between items-center">
            <div className="flex flex-row items-center gap-2">
              <Typography
                variant={isMobile ? 'h3' : 'h1'}
                className={`!text-primary !line-clamp-1 ${
                  isMobile
                    ? '!leading-[38px] !text-[28px] !font-bold !tracking-[0.4px]'
                    : ''
                }`}
              >
                {formatThaiBaht(
                  currentActiveVariant?.productDiscount?.value
                    ? currentActiveVariant.productDiscount.value
                    : currentActiveVariant?.price
                )}
              </Typography>
              {currentActiveVariant?.productDiscount?.value && (
                <Typography
                  variant={!isMobile ? 'paragraph-small' : 'paragraph-big'}
                  className={`!text-text-disabled !line-through !line-clamp-1 ${
                    !isMobile ? '!text-[14px]' : ''
                  }`}
                >
                  {formatThaiBaht(currentActiveVariant?.price)}
                </Typography>
              )}
            </div>
            <div>
              <Typography
                variant="paragraph-medium"
                className="!text-text-quinary"
              >
                {`พร้อมขาย ${getSoldDisplay(
                  currentActiveVariant?.stock?.remaining || 0
                )} รายการ`}
              </Typography>
            </div>
          </div>
          <div className="flex w-full items-center gap-2">
            <CustomButton
              className="w-full"
              variant="outlined"
              color="neutral"
              onClick={onClose}
            >
              ยกเลิก
            </CustomButton>
            <CustomButton
              className="w-full"
              disabled={!currentActiveVariant}
              onClick={() => {
                setActiveVariant(currentActiveVariant || null);
                onClose();
              }}
            >
              ปรับใช้
            </CustomButton>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default ProductVariantDrawer;
