'use client';

import { useState } from 'react';
import CustomButton from '@/components/Button';
import Typography from '@/components/Typography';
import { useRouter } from 'next/navigation';
import { routes } from '@/constants/routing.constants';
import { useProductExport } from '../hooks/useProductExport';
import LoadingOverlay from '@/components/Loading/LoadingOverlay';
import ImportProductModal from "../matching/components/ImportProductModal";
import { PRODUCTS_HEADER_UI, PRICE_TYPE_MAP } from '../constants/products.constants';
import type { PriceDisplayMode } from '../constants/products.constants';
import type { IRequestExportProducts } from '@/interfaces/product/product.request.interface';
export interface ProductsHeaderProps {
  merchantSlug: string;
  currentFilters?: IRequestExportProducts;
}
export interface ProductsHeaderWithPriceProps extends ProductsHeaderProps {
  priceDisplayMode?: PriceDisplayMode;
}

export const ProductsHeader: React.FC<ProductsHeaderWithPriceProps> = ({ 
  merchantSlug, 
  priceDisplayMode = 'without-vat'
}) => {
  const router = useRouter();
  const { isExporting, handleExport } = useProductExport(merchantSlug);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleExportClick = () => {
    const priceType = PRICE_TYPE_MAP[priceDisplayMode];    
    const exportFilters = {
      priceType,
    };
    
    handleExport(exportFilters);
  };

  return (
    <>
      <div className="flex justify-between items-end">
        <div>
          <Typography variant="h3" className="!text-text-primary !font-bold">
            {PRODUCTS_HEADER_UI.TITLE}
          </Typography>
          <Typography variant="paragraph-medium" className="!text-text-tertiary">
            {PRODUCTS_HEADER_UI.SUBTITLE}
          </Typography>
        </div>
        <div className="flex gap-3">
          <CustomButton
            variant="outlined"
            color="primary"
            icon={<i className="ri-download-line"></i>}
            onClick={handleExportClick}
            loading={isExporting}
            disabled={isExporting}
            className="!bg-white"
          >
            {PRODUCTS_HEADER_UI.BTN_EXPORT}
          </CustomButton>
          <CustomButton
            variant="outlined"
            color="primary"
            icon={<i className="ri-upload-2-line"></i>}
            onClick={() => setIsImportModalOpen(true)}
            className="!bg-white"
          >
            {PRODUCTS_HEADER_UI.BTN_IMPORT}
          </CustomButton>
          <CustomButton 
            icon={<i className="ri-add-line"></i>} 
            onClick={() => router.push(routes.productAdd())}
          >
            {PRODUCTS_HEADER_UI.BTN_ADD}
          </CustomButton>
        </div>
      </div>

      <LoadingOverlay visible={isExporting} size={60} />

      <ImportProductModal
        visible={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </>
  );
};
