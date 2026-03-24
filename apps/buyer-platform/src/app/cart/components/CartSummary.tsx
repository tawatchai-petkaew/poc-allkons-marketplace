import CustomButton from '@/components/Button';
import { Label } from '@/components/Label';
import Typography from '@/components/Typography';
import { formatThaiBaht } from '@/utils/format';
import { Skeleton, Tooltip } from 'antd';

interface CartSummaryProps {
  summary: {
    price: number;
    discount: number;
    priceBeforeVat: number;
    vat: number;
    total: number;
    itemCount: number;
  };
  onCheckout: () => void;
  onRequestQuote?: () => void;
  isDesktop?: boolean;
  isMobile?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  isUpdating?: boolean;
}

/**
 * Cart summary component showing price breakdown and checkout buttons
 *
 * Features:
 * - Price breakdown (original, discount, VAT, total)
 * - Item count label
 * - Checkout button
 * - Request quotation button
 * - Mobile collapsible view
 *
 * @example
 * <CartSummary
 *   summary={summary}
 *   onCheckout={goToCheckout}
 *   isDesktop={isDesktop}
 * />
 */
export default function CartSummary({
  summary,
  onCheckout,
  onRequestQuote,
  isDesktop = false,
  isMobile = false,
  isOpen = false,
  onToggle,
  isUpdating = false,
}: CartSummaryProps) {
  const hasItems = summary.itemCount > 0;

  return (
    <div
      className={`${
        isDesktop ? 'h-fit w-[25%]' : 'w-full relative'
      } bg-background-primary rounded-2xl p-4 border-border-primary`}
    >
      {/* Toggle button for mobile */}
      {!isDesktop && onToggle && (
        <div
          className="bg-background-primary z-40 absolute top-0 -translate-y-5 right-0 flex items-center justify-center w-[2rem] h-6 rounded-t-lg cursor-pointer"
          onClick={onToggle}
        >
          <i
            className={
              isOpen
                ? 'ri-arrow-down-s-line text-xl'
                : 'ri-arrow-up-s-line text-xl'
            }
          ></i>
        </div>
      )}
      <div className="flex flex-col">
        {/* Price breakdown - collapsible on mobile */}
        {(isDesktop || isOpen) && (
          <>
            <div className="flex flex-col gap-3 pt-2">
              {/* Original Price */}
              <Typography variant="h4">สรุปคำสั่งซื้อ</Typography>
              <div className="flex items-center justify-between mt-1 xl:mt-4">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Typography
                    variant={
                      isMobile
                        ? 'paragraph-middle-regular'
                        : 'paragraph-big-regular'
                    }
                    className="!text-text-secondary whitespace-nowrap"
                  >
                    ราคา
                  </Typography>
                  {isDesktop && (
                    <Label
                      text={
                        !hasItems
                          ? 'กรุณาเลือกสินค้า'
                          : `${summary.itemCount} รายการ`
                      }
                      variant="outlined"
                      rounding="pill"
                      size="small"
                      prefix={
                        !hasItems ? (
                          <i className="ri-information-line text-neutral-40 -ml-1"></i>
                        ) : null
                      }
                    />
                  )}
                </div>
                {isUpdating ? (
                  <Skeleton.Input active size="small" style={{ width: 80 }} />
                ) : (
                  <Typography
                    variant={
                      isMobile
                        ? 'paragraph-middle-medium'
                        : 'paragraph-big-medium'
                    }
                  >
                    {formatThaiBaht(summary.price)}
                  </Typography>
                )}
              </div>

              {/* Discount */}
              <div className="flex items-center justify-between">
                <Typography
                  variant={
                    isMobile
                      ? 'paragraph-middle-regular'
                      : 'paragraph-big-regular'
                  }
                  className="!text-text-secondary whitespace-nowrap flex-shrink-0"
                >
                  ส่วนลด
                </Typography>
                {isUpdating ? (
                  <Skeleton.Input active size="small" style={{ width: 80 }} />
                ) : (
                  <Typography
                    variant={
                      isMobile
                        ? 'paragraph-middle-medium'
                        : 'paragraph-big-medium'
                    }
                  >
                    {formatThaiBaht(summary.discount)}
                  </Typography>
                )}
              </div>

              {/* Price Before VAT */}
              <div className="flex items-center justify-between">
                <Typography
                  variant={
                    isMobile
                      ? 'paragraph-middle-regular'
                      : 'paragraph-big-regular'
                  }
                  className="!text-text-secondary whitespace-nowrap flex-shrink-0"
                >
                  ราคาก่อนภาษี
                </Typography>
                {isUpdating ? (
                  <Skeleton.Input active size="small" style={{ width: 80 }} />
                ) : (
                  <Typography
                    variant={
                      isMobile
                        ? 'paragraph-middle-medium'
                        : 'paragraph-big-medium'
                    }
                  >
                    {formatThaiBaht(summary.priceBeforeVat)}
                  </Typography>
                )}
              </div>

              {/* VAT */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Typography
                    variant={
                      isMobile
                        ? 'paragraph-middle-regular'
                        : 'paragraph-big-regular'
                    }
                    className="!text-text-secondary whitespace-nowrap"
                  >
                    ภาษีมูลค่าเพิ่ม
                  </Typography>
                  <Label
                    text="7%"
                    variant="outlined"
                    rounding="pill"
                    size="small"
                  />
                </div>
                {isUpdating ? (
                  <Skeleton.Input active size="small" style={{ width: 80 }} />
                ) : (
                  <Typography
                    variant={
                      isMobile
                        ? 'paragraph-middle-medium'
                        : 'paragraph-big-medium'
                    }
                    className="!font-medium"
                  >
                    {formatThaiBaht(summary.vat)}
                  </Typography>
                )}
              </div>
            </div>

            <div className="w-full h-[1px] bg-border-primary my-4"></div>
          </>
        )}

        {/* Total */}
        <div className="flex flex-col">
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-1 flex-shrink-0">
              <Typography
                variant="paragraph-big-semibold"
                className="whitespace-nowrap"
              >
                ราคารวมสุทธิ
              </Typography>
              {!isDesktop && (
                <Label
                  text={
                    !hasItems
                      ? 'กรุณาเลือกสินค้า'
                      : `${summary.itemCount} รายการ`
                  }
                  variant="outlined"
                  rounding="pill"
                  size="small"
                  prefix={
                    !hasItems ? (
                      <i className="ri-information-line text-neutral-40 -ml-1"></i>
                    ) : null
                  }
                />
              )}
            </div>
            <Typography
              variant="paragraph-small"
              className="!text-text-quinary"
            >
              *ไม่รวมค่าจัดส่ง
            </Typography>
          </div>
          <div className="text-right">
            {isUpdating ? (
              <Skeleton.Input
                active
                size={isMobile ? 'small' : 'default'}
                style={{ width: 120 }}
              />
            ) : (
              <Typography
                variant={isMobile ? 'h4' : 'h3'}
                className={`${
                  summary.total <= 0
                    ? '!text-text-disabled'
                    : '!text-primary-dark'
                }`}
              >
                {formatThaiBaht(summary.total)}
              </Typography>
            )}

            <Typography
              variant="paragraph-small"
              className="!text-text-quinary"
            >
              รวมภาษีมูลค่าเพิ่ม 7%
            </Typography>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-row xl:flex-col gap-3 mt-6">
          <Tooltip
            title={
              isUpdating
                ? 'กำลังอัปเดตข้อมูล'
                : !hasItems
                  ? 'กรุณาเลือกสินค้าอย่างน้อย 1 รายการ'
                  : ''
            }
            placement="top"
          >
            <div className="order-2 xl:order-1 flex-[0.85] sm:flex-1">
              <CustomButton
                size="large"
                onClick={onCheckout}
                disabled={!hasItems || isUpdating}
                className="w-full min-h-[48px]"
              >
                <Typography
                  variant={isMobile ? 'button-middle' : 'button-big'}
                  className={`${
                    !hasItems || isUpdating
                      ? '!text-text-disabled'
                      : '!text-white'
                  }`}
                >
                  ดำเนินการต่อ
                </Typography>
              </CustomButton>
            </div>
          </Tooltip>
          <CustomButton
            disabled
            size="large"
            onClick={onRequestQuote}
            className="order-1 xl:order-2 flex-[1.15] sm:flex-1 min-h-[48px]"
          >
            <div className="flex gap-1 items-center !text-text-disabled">
              <i className="ri-add-line text-xl"></i>
              <Typography
                variant={isMobile ? 'button-middle' : 'button-big'}
                className="!text-inherit"
              >
                เพิ่มใบเสนอราคา
              </Typography>
            </div>
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
