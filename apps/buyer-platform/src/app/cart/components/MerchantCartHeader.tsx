import { Row, Col } from 'antd';
import Checkbox from '@/components/DataEntry/Checkbox';
import Typography from '@/components/Typography';

interface MerchantHeaderProps {
  merchantId: number;
  merchantName: string;
  merchantLogo?: string;
  isChecked: boolean;
  onToggle: (merchantId: number) => void;
  onDelete?: (merchantId: number) => void;
  isDesktop?: boolean;
  selectedCount?: number;
  totalCount?: number;
}

/**
 * Merchant header component for cart page
 * Shows merchant logo, name and checkbox for selecting all items from this merchant
 *
 * @example
 * <MerchantHeader
 *   merchantId={cart.id}
 *   merchantName={cart.merchant.name || cart.merchant.organizeName}
 *   merchantLogo={cart.merchant.logo}
 *   isChecked={isMerchantChecked(cart.id)}
 *   onToggle={toggleMerchant}
 *   isDesktop={isDesktop}
 * />
 */
export default function MerchantCartHeader({
  merchantId,
  merchantName,
  merchantLogo,
  isChecked,
  onToggle,
  onDelete,
  isDesktop = false,
  selectedCount = 0,
  totalCount = 0,
}: MerchantHeaderProps) {
  const isIndeterminate = selectedCount > 0 && selectedCount < totalCount;

  return (
    <div className="bg-background-secondary rounded-lg p-2 md:p-4">
      {isDesktop ? (
        // Desktop: Grid layout matching CartItem
        <Row align="middle" gutter={16}>
          <Col span={1} className="flex justify-center">
            <Checkbox
              checked={isChecked}
              indeterminate={isIndeterminate}
              onChange={() => onToggle(merchantId)}
            />
          </Col>
          <Col span={22}>
            <div className="flex items-center gap-3">
              {merchantLogo && (
                <img
                  src={merchantLogo}
                  alt={merchantName || 'Merchant'}
                  className="w-10 h-10 object-contain rounded-full bg-background-tertiary"
                />
              )}
              <Typography
                variant="paragraph-small-regular"
                className="!text-text-secondary"
              >
                {merchantName || 'ผู้ขาย'}
              </Typography>
            </div>
          </Col>
          {onDelete && (
            <Col span={1}>
              <button
                className="text-xl hover:bg-background-primary-hover rounded-lg py-1"
                onClick={() => onDelete(merchantId)}
                title="ลบสินค้าทั้งหมดในร้านนี้"
              >
                <i className="ri-delete-bin-line"></i>
              </button>
            </Col>
          )}
        </Row>
      ) : (
        // Mobile: Flex layout matching CartItem
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Checkbox
              checked={isChecked}
              indeterminate={isIndeterminate}
              onChange={() => onToggle(merchantId)}
              label={null}
            />
            {merchantLogo && (
              <img
                src={merchantLogo}
                alt={merchantName || 'Merchant'}
                className="w-8 h-8 object-contain rounded-full bg-background-tertiary"
              />
            )}
            <Typography
              variant="paragraph-small-regular"
              className="!text-text-secondary"
            >
              {merchantName || 'ผู้ขาย'}
            </Typography>
          </div>
          {onDelete && (
            <button
              className="text-xl hover:bg-background-primary-hover rounded-lg px-2 py-1 text-right"
              onClick={() => onDelete(merchantId)}
              title="ลบสินค้าทั้งหมดในร้านนี้"
            >
              <i className="ri-delete-bin-line"></i>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
