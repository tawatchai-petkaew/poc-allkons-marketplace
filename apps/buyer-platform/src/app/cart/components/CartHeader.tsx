import Typography from '@/components/Typography';
import Checkbox from '@/components/DataEntry/Checkbox';
import { Row, Col } from 'antd';

interface CartHeaderProps {
  isMobile: boolean;
  isDesktop: boolean;
  is2Xl: boolean;
  allChecked?: boolean;
  onToggleAll?: () => void;
  onClearAll?: () => void;
  isShowCartHeader?: boolean;
  selectedCount?: number;
  totalCount?: number;
}

/**
 * Cart page header component
 *
 * Features:
 * - Back button
 * - Page title
 * - Select all checkbox (desktop only)
 * - Column headers (desktop only)
 *
 * @example
 * <CartHeader
 *   isDesktop={isDesktop}
 *   isMobile={isMobile}
 *   allChecked={allChecked}
 *   onToggleAll={toggleAll}
 *   showSelectAll={carts.length > 0}
 * />
 */
export default function CartHeader({
  isMobile = false,
  isDesktop = false,
  is2Xl,
  allChecked = false,
  onToggleAll,
  onClearAll,
  isShowCartHeader = false,
  selectedCount = 0,
  totalCount = 0,
}: CartHeaderProps) {
  const isIndeterminate = selectedCount > 0 && selectedCount < totalCount;

  return (
    <>
      {isShowCartHeader && (
        <div className="w-full rounded-2xl p-2 md:p-4 bg-background-primary">
          {isDesktop ? (
            // Desktop: Grid layout
            <Row align="middle" gutter={16} className="px-4">
              <Col span={1} className="flex justify-center">
                <Checkbox
                  checked={allChecked}
                  indeterminate={isIndeterminate}
                  onChange={onToggleAll}
                />
              </Col>
              <Col span={9}>
                <Typography
                  variant="paragraph-small-regular"
                  className="!text-text-secondary"
                >
                  สินค้า
                </Typography>
              </Col>
              <Col span={is2Xl ? 3 : 4}>
                <Typography
                  variant="paragraph-small-regular"
                  className="!text-text-secondary"
                >
                  ราคาต่อหน่วย
                </Typography>
              </Col>
              <Col span={is2Xl ? 4 : 5}>
                <Typography
                  variant="paragraph-small-regular"
                  className="!text-text-secondary"
                >
                  จำนวน
                </Typography>
              </Col>
              <Col span={is2Xl ? 6 : 4}>
                <Typography
                  variant="paragraph-small-regular"
                  className="!text-text-secondary"
                >
                  ราคารวม
                </Typography>
              </Col>
              <Col span={1} className="flex justify-center">
                {onClearAll && (
                  <button
                    className="text-xl hover:bg-background-primary-hover rounded-lg py-1"
                    onClick={onClearAll}
                    title="ลบสินค้าทั้งหมดในตะกร้า"
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                )}
              </Col>
            </Row>
          ) : (
            // Mobile: Flex layout
            <div className="flex items-center justify-between px-2 sm:px-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={allChecked}
                  indeterminate={isIndeterminate}
                  onChange={onToggleAll}
                />
                <Typography
                  variant="paragraph-small-regular"
                  className="!text-text-secondary"
                >
                  สินค้า
                </Typography>
              </div>
              <div className="flex items-center gap-2">
                <Typography
                  variant="paragraph-small-regular"
                  className="!text-text-secondary"
                >
                  ราคารวม
                </Typography>
                <button
                  className="text-xl hover:bg-background-primary-hover rounded-lg px-2 text-right"
                  onClick={onClearAll}
                  title="ลบสินค้าทั้งหมดในตะกร้า"
                >
                  <i className="ri-delete-bin-line"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
