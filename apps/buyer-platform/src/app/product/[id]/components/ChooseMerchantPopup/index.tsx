import { getProductMerchantsBySlug } from '@/common/api/product-service/product.api';
import { IProduct } from '@/common/interfaces/product.interface';
import ResponsivePopup from '@/components/Popup';
import Typography from '@/components/Typography';
import { PopupParams, PopupType } from '@/hooks/usePopup';
import { useScreenWidth } from '@/hooks/useScreenWidth';
import { formatThaiBaht, getDiscountPrice } from '@/utils/format';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Skeleton } from 'antd';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import MerchantPopupSkeleton from './Skeleton';

interface ChooseMerchantPopupProps {
  productSlug: string;
  quantity: number;
  isOpen: boolean;
  onClose: () => void;
  setIsSelectedMerchant: (product: IProduct) => void;
  showPopup: (type: PopupType, params: PopupParams) => void;
  setIsOpenMerchantPopup: (isOpen: boolean) => void;
}

export default function ChooseMerchantPopup({
  productSlug,
  quantity,
  isOpen,
  onClose,
  setIsSelectedMerchant,
  showPopup,
  setIsOpenMerchantPopup,
}: ChooseMerchantPopupProps) {
  const isMobile = useScreenWidth() < 768;

  const [products, setProducts] = useState<IProduct[]>([]);
  const [ref, inView] = useInView();

  const {
    data: productMerchantQuery,
    hasNextPage,
    fetchNextPage,
    error,
    refetch,
    isLoading,
    isPending,
  } = useInfiniteQuery({
    queryKey: ['product-merchants', productSlug],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getProductMerchantsBySlug(
        productSlug,
        pageParam,
        20
      );
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (res) => {
      if (!res || !res.meta) return undefined;
      if (res.meta.currentPage < res.meta.totalPages) {
        return res.meta.currentPage + 1;
      }
      return undefined;
    },
    enabled: isOpen,
  });

  useEffect(() => {
    if (productMerchantQuery?.pages) {
      const allProducts = productMerchantQuery.pages.flatMap(
        (page) => page.data
      );
      setProducts(allProducts);
    }
  }, [productMerchantQuery]);

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  useEffect(() => {
    if (error && products?.length === 0) {
      onClose();
      showPopup('error', {
        title: 'เกิดข้อผิดพลาด',
        description: 'เกิดข้อผิดพลาดในการดึงข้อมูลสาขา',
        showRetry: true,
        onRetry: () => {
          onClose();
          setIsOpenMerchantPopup(true);
          refetch();
        },
      });
    }
  }, [error, products]);

  return (
    <ResponsivePopup
      visible={isOpen}
      onClose={onClose}
      modalProps={{ closable: true, width: 800 }}
      drawerProps={{ closable: true }}
      drawerTitle={
        products?.length === 0 && (isLoading || isPending) ? null : (
          <div className="flex flex-col ml-6">
            <Typography variant="h4">เลือกร้านใกล้ไซต์งาน</Typography>
            <Typography
              variant="paragraph-middle-regular"
              className="!text-text-tertiary"
            >
              {products?.length || 0} สาขาใกล้ไซต์ พร้อมจัดส่ง
            </Typography>
          </div>
        )
      }
      modalTitle={
        products?.length === 0 && (isLoading || isPending) ? null : (
          <div className="flex flex-col mb-[2rem]">
            <Typography variant="h4">เลือกร้านใกล้ไซต์งาน</Typography>
            <Typography
              variant="paragraph-middle-regular"
              className="!text-text-tertiary"
            >
              {products?.length || 0} สาขาใกล้ไซต์ พร้อมจัดส่ง
            </Typography>
          </div>
        )
      }
    >
      <div>
        {products?.length === 0 && (isLoading || isPending) ? (
          <MerchantPopupSkeleton />
        ) : (
          <div className="w-full">
            {/* Header Row */}
            <div className="grid grid-cols-12 gap-2 bg-background-secondary p-2 rounded-lg">
              <div className="col-span-5 place-content-center">
                <Typography
                  variant="paragraph-extra-small-regular"
                  className="!text-text-quinary"
                >
                  ร้านค้า
                </Typography>
              </div>
              {isMobile ? null : (
                <div className="col-span-3 place-content-center">
                  <Typography
                    variant="paragraph-extra-small-regular"
                    className="!text-text-quinary"
                  >
                    ราคาต่อหน่วย
                  </Typography>
                </div>
              )}

              <div className="col-span-7 md:col-span-4 place-content-center">
                <Typography
                  variant="paragraph-extra-small-regular"
                  className="!text-text-quinary text-right md:text-left"
                >
                  ราคารวม
                </Typography>
              </div>
            </div>

            {/* Data Rows */}
            <div className="space-y-3 mt-3">
              {products.map((product, index) => {
                const price = product?.productItems[0]?.price;
                const discount = getDiscountPrice(
                  price,
                  product?.productItems[0]?.productDiscount || undefined
                );
                const finalPrice = price - discount;

                if (isMobile) {
                  return (
                    <div
                      key={product.id || index}
                      className="p-2 hover:bg-gray-50 rounded-xl cursor-pointer border border-border-primary flex gap-2"
                      onClick={() => setIsSelectedMerchant(product)}
                      ref={index === products.length - 1 ? ref : undefined}
                    >
                      <div className="aspect-square flex items-center justify-center w-12 h-12">
                        {product.merchant?.merchantIcon?.imageUpload?.url &&
                        product.merchant?.merchantIcon?.imageUpload?.url !==
                          '' ? (
                          <Image
                            src={
                              product.merchant?.merchantIcon?.imageUpload?.url
                            }
                            width={48}
                            height={48}
                            alt={product.name}
                            onError={(e) => {
                              e.currentTarget.src = '/assets/default-image.png';
                            }}
                          />
                        ) : (
                          <Image
                            src={'/assets/default-image.png'}
                            width={48}
                            height={48}
                            alt={product.name}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <div>
                          <Typography
                            variant={'paragraph-small-medium'}
                            className={` !text-text-secondary !line-clamp-1`}
                          >
                            {product.merchant?.store?.storeBranchName || 'N/A'}
                          </Typography>
                          <Typography
                            variant="paragraph-extra-small-regular"
                            className="!line-clamp-1 !text-text-tertiary"
                          >
                            {product.merchant?.merchantTranslations[0]?.name ||
                              'N/A'}
                          </Typography>
                        </div>
                        <div className="flex justify-between items-end">
                          <div>
                            <Typography
                              variant="paragraph-extra-small-regular"
                              className="!line-clamp-1 !text-text-quinary"
                            >
                              ราคาต่อหน่วย
                            </Typography>
                            <Typography
                              variant="paragraph-extra-small-regular"
                              className="!line-clamp-1 !text-text-secondary"
                            >
                              {formatThaiBaht(finalPrice)}
                            </Typography>
                          </div>
                          <div className="relative">
                            <Typography
                              variant={'h5'}
                              className="!text-primary !line-clamp-1"
                            >
                              {formatThaiBaht(finalPrice * quantity)}
                            </Typography>
                            {discount > 0 && (
                              <Typography
                                variant={'paragraph-small-strikethrough'}
                                className="!text-text-disabled !line-clamp-1 absolute -top-4 left-0"
                              >
                                {formatThaiBaht(price * quantity)}
                              </Typography>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={product.id || index}
                    className="grid grid-cols-12 gap-2 items-center p-2 hover:bg-gray-50 rounded-xl cursor-pointer border border-border-primary"
                    onClick={() => setIsSelectedMerchant(product)}
                    ref={index === products.length - 1 ? ref : undefined}
                  >
                    {/* Product Column */}
                    <div className="col-span-5">
                      <div className="flex items-center gap-2">
                        <div className="aspect-square flex items-center justify-center w-12 h-12">
                          {product.merchant?.merchantIcon?.imageUpload?.url &&
                          product.merchant?.merchantIcon?.imageUpload?.url !==
                            '' ? (
                            <Image
                              src={
                                product.merchant?.merchantIcon?.imageUpload?.url
                              }
                              width={48}
                              height={48}
                              alt={product.name}
                              onError={(e) => {
                                e.currentTarget.src =
                                  '/assets/default-image.png';
                              }}
                            />
                          ) : (
                            <Image
                              src={'/assets/default-image.png'}
                              width={48}
                              height={48}
                              alt={product.name}
                            />
                          )}
                        </div>
                        <div>
                          <Typography
                            variant={'paragraph-middle-medium'}
                            className={` !text-text-secondary !line-clamp-1`}
                          >
                            {product.merchant?.store?.storeBranchName || 'N/A'}
                          </Typography>
                          <Typography
                            variant="paragraph-extra-small-regular"
                            className="!line-clamp-1"
                          >
                            {product.merchant?.merchantTranslations[0]?.name ||
                              'N/A'}
                          </Typography>
                        </div>
                      </div>
                    </div>

                    {/* Price Column */}
                    <div className="col-span-3">
                      <Typography
                        variant="paragraph-small-regular"
                        className="!text-secondary !line-clamp-1"
                      >
                        {formatThaiBaht(finalPrice)}
                      </Typography>
                    </div>

                    {/* Total Column */}
                    <div className="col-span-4">
                      <div className="relative">
                        <Typography
                          variant={'h5'}
                          className="!text-primary !line-clamp-1"
                        >
                          {formatThaiBaht(finalPrice * quantity)}
                        </Typography>
                        {discount > 0 && (
                          <Typography
                            variant={'paragraph-small-strikethrough'}
                            className="!text-text-disabled !line-clamp-1 absolute -top-4 left-0"
                          >
                            {formatThaiBaht(price * quantity)}
                          </Typography>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </ResponsivePopup>
  );
}
