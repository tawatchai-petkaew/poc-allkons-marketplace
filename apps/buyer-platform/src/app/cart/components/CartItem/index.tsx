'use client';
import Checkbox from '@/components/DataEntry/Checkbox';
import { Label } from '@/components/Label';
import Typography from '@/components/Typography';
import {
  formatThaiBaht,
  getDiscountPrice,
  getFinalPrice,
} from '@/utils/format';
import { Row, Col } from 'antd';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import './custom.css';
import { CartItem } from '@/hooks/useCartData';
import { UpdateCartItemPayload } from '@/common/api/order-service/cart.api';
import { ProductDiscount } from '@/common/interfaces/product.interface';
import { useCartItemUpdate } from '@/hooks/useCartItemUpdate';
import QuantityControls from '@/app/cart/components/QuantityControls';

interface Props {
  isMobile: boolean;
  isDesktop: boolean;
  isXs: boolean;
  is2Xl: boolean;
  item: CartItem;
  onDelete: (id: number) => void;
  onSelect: (id: number) => void;
  count: number;
  setCount: (payload: UpdateCartItemPayload, onError?: () => void) => void;
  onPendingChange?: (itemId: number, isPending: boolean) => void;
  isLastItem?: boolean;
}

export default function CartItemCard({
  isMobile,
  isDesktop,
  isXs,
  is2Xl,
  item,
  onDelete,
  onSelect,
  count,
  setCount,
  onPendingChange,
  isLastItem = false,
}: Props) {
  const [isChecked, setIsChecked] = useState(item.isChecked);

  const imagePath = item.productItem.product.productImages[0]?.imageUpload?.url;

  // Use custom hook for quantity management in each cart item
  const {
    localCount,
    increment,
    decrement,
    handleChange,
    handleBlur,
    isLoading,
  } = useCartItemUpdate({
    count,
    itemId: item.id,
    productItemId: item.productItem.id,
    unit: item.unit,
    onUpdate: setCount,
    onPendingChange,
  });

  useEffect(() => {
    setIsChecked(item.isChecked);
  }, [item.isChecked]);

  const discountPrice = getDiscountPrice(
    item.productItem.price,
    item?.productItem?.productDiscount as ProductDiscount
  );

  return (
    <div
      className={`relative py-2 md:py-4 ${
        isLastItem ? '' : 'border-b'
      } lg:border-none`}
    >
      <div className="flex flex-col gap-3">
        {isDesktop ? (
          <div className="w-full rounded-2xl py-2 bg-background-primary">
            <Row align="middle" gutter={16} className="px-4">
              <Col span={1} className="flex justify-center">
                <Checkbox
                  checked={isChecked}
                  onChange={() => {
                    setIsChecked(!isChecked);
                    onSelect(item.id);
                  }}
                />
              </Col>
              <Col span={9}>
                <div className="flex items-center gap-3">
                  <div className="flex justify-center items-center h-[72px] w-[72px] aspect-square bg-background-secondary/80 rounded-xl">
                    {imagePath && imagePath !== '' ? (
                      <Image
                        src={imagePath}
                        width={72}
                        height={72}
                        alt={item.productItem.product.name}
                        className="w-full h-auto object-center object-cover rounded-xl aspect-square"
                        onError={(e) => {
                          e.currentTarget.src = '/assets/default-image.png';
                          e.currentTarget.className = 'w-[60%] h-auto';
                        }}
                      />
                    ) : (
                      <Image
                        src="/assets/default-image.png"
                        width={72}
                        height={72}
                        alt="Default product image"
                        className="w-[60%] h-auto"
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-1 h-auto justify-between flex-1">
                    <Typography
                      variant="paragraph-middle-regular"
                      className="!text-text-secondary !line-clamp-2"
                    >
                      {item.productItem.product.name}
                    </Typography>
                    {item.productItem.primaryOptionsValue && (
                      <div className="flex items-center gap-2 h-fit overflow-scroll  md:max-w-[25vw] xl:max-w-[15vw]">
                        <Label
                          text={item.productItem.primaryOptionsValue}
                          rounding="pill"
                          variant="ghost"
                          size="small"
                        />
                        {item.productItem.secondaryOptionsValue && (
                          <Label
                            text={item.productItem.secondaryOptionsValue}
                            rounding="pill"
                            variant="ghost"
                            size="small"
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Col>
              <Col span={is2Xl ? 3 : 4}>
                <Typography
                  variant="paragraph-extra-small-regular"
                  className="!line-clamp-1"
                >
                  {formatThaiBaht(
                    getFinalPrice(item.productItem.price, discountPrice)
                  )}
                </Typography>
              </Col>
              <Col span={is2Xl ? 4 : 5}>
                <QuantityControls
                  value={localCount}
                  onIncrement={increment}
                  onDecrement={decrement}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  loading={isLoading}
                />
              </Col>
              <Col span={is2Xl ? 6 : 4} className="place-items-end">
                <div className="relative text-right">
                  <Typography
                    variant="h5"
                    className="!text-primary !line-clamp-1"
                  >
                    {formatThaiBaht(
                      getFinalPrice(item.productItem.price, discountPrice) *
                        localCount
                    )}
                  </Typography>
                  {discountPrice > 0 && (
                    <Typography
                      variant="paragraph-middle-strikethrough"
                      className="!text-text-disabled !line-clamp-1 absolute -top-4 right-0"
                    >
                      {formatThaiBaht(item.productItem.price * localCount)}
                    </Typography>
                  )}
                </div>
              </Col>
              <Col span={1}>
                <button
                  className="text-xl hover:bg-background-primary-hover rounded-lg py-1"
                  onClick={() => onDelete(item.id)}
                >
                  <i className="ri-delete-bin-line"></i>
                </button>
              </Col>
            </Row>
          </div>
        ) : (
          <div className="flex px-2 sm:px-4 gap-1">
            <div className="flex !h-full justify-center items-start">
              <Checkbox
                checked={isChecked}
                onChange={() => {
                  setIsChecked(!isChecked);
                  onSelect(item.id);
                }}
              />
            </div>
            <div className="flex flex-col gap-4 w-full">
              <div className="flex gap-2 md:gap-4">
                <div className="flex justify-center items-center h-[64px] w-[64px] aspect-square bg-background-secondary/80 rounded-xl">
                  {imagePath && imagePath !== '' ? (
                    <Image
                      src={imagePath}
                      width={0}
                      height={0}
                      alt={item.productItem.product.name}
                      className="w-full h-auto object-center object-cover rounded-xl aspect-square"
                      onError={(e) => {
                        e.currentTarget.src = '/assets/default-image.png';
                        e.currentTarget.className = 'w-[60%] h-auto';
                      }}
                    />
                  ) : (
                    <Image
                      src="/assets/default-image.png"
                      width={0}
                      height={0}
                      alt={item.productItem.product.name}
                      className="w-[60%] h-auto"
                    />
                  )}
                </div>
                <div className="flex justify-between w-full">
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-col gap-1 justify-between">
                      <Typography
                        variant="paragraph-small-regular"
                        className="!text-text-secondary !line-clamp-2"
                      >
                        {item.productItem.product.name}
                      </Typography>
                    </div>
                    {/* {Object.entries(item.productItem.variants).length > 0 && (
                      <div
                        className={`flex ${
                          isXs ? "!max-w-[30vw]" : ""
                        } items-center gap-2 overflow-x-scroll max-w-[40vw] sm:max-w-[50vw] md:max-w-[40vw] ${
                          isMobile ? "hide-scrollbar" : ""
                        }`}
                      >
                        {(
                          Object.entries(item.productItem.variants) as [
                            string,
                            string
                          ][]
                        ).map(([key, value]) => (
                          <Label
                            key={key}
                            text={value}
                            variant="ghost"
                            rounding="pill"
                            size="small"
                          />
                        ))}
                      </div>
                    )} */}
                    {item.productItem.primaryOptionsValue && (
                      <div
                        className={`flex ${
                          isXs ? '!max-w-[30vw]' : ''
                        } items-center gap-2 overflow-x-scroll max-w-[40vw] sm:max-w-[50vw] md:max-w-[40vw] ${
                          isMobile ? 'hide-scrollbar' : ''
                        }`}
                      >
                        <Label
                          text={item.productItem.primaryOptionsValue}
                          rounding="pill"
                          variant="ghost"
                          size="small"
                        />
                        {item.productItem.secondaryOptionsValue && (
                          <Label
                            text={item.productItem.secondaryOptionsValue}
                            rounding="pill"
                            variant="ghost"
                            size="small"
                          />
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    className="text-xl h-fit hover:bg-background-primary-hover rounded-lg px-2 py-1 ml-auto"
                    onClick={() => onDelete(item.id)}
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <QuantityControls
                  value={localCount}
                  onIncrement={increment}
                  onDecrement={decrement}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  loading={isLoading}
                />
                <div className="relative flex-1 text-right">
                  <Typography
                    variant={'h6'}
                    className="!text-primary !line-clamp-1"
                  >
                    {formatThaiBaht(
                      getFinalPrice(item.productItem.price, discountPrice) *
                        localCount
                    )}
                  </Typography>
                  {discountPrice > 0 && (
                    <Typography
                      variant={'paragraph-small-strikethrough'}
                      className="!text-text-disabled !line-clamp-1 absolute -top-4 right-0"
                    >
                      {formatThaiBaht(item.productItem.price * localCount)}
                    </Typography>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
