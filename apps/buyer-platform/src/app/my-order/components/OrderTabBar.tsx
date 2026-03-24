import { SubOrderStatus } from '@/common/enum/suborder.enum';
import Typography from '@/components/Typography';

interface OrderTabBarProps {
  activeTab: string;
  orderCounts?: Array<{ status: SubOrderStatus; count: string }>;
  onTabChange: (key: string) => void;
}

export default function OrderTabBar({
  activeTab,
  orderCounts,
  onTabChange,
}: OrderTabBarProps) {
  const tabs = [
    { key: '1', title: 'ออเดอร์ทั้งหมด', status: null },
    { key: '2', title: 'รอเลือกชำระ', status: SubOrderStatus.NEW },
    {
      key: '3',
      title: 'รอค่าจัดส่ง',
      status: SubOrderStatus.WAITING_DELIVERY_FEE,
    },
    { key: '4', title: 'ที่ต้องชำระ', status: SubOrderStatus.PENDING_PAYMENT },
    {
      key: '5',
      title: 'รอร้านค้าตรวจสอบการชำระ',
      status: SubOrderStatus.PENDING_VERIFY,
    },
    { key: '6', title: 'ที่ต้องส่ง', status: SubOrderStatus.PREPARE_PRODUCT },
    { key: '7', title: 'ที่ต้องได้รับ', status: SubOrderStatus.DELIVERY },
    { key: '8', title: 'สำเร็จแล้ว', status: SubOrderStatus.SUCCESS },
    { key: '9', title: 'ยกเลิก', status: SubOrderStatus.CANCEL },
  ];

  return (
    <div className="max-w-full overflow-x-auto">
      <div className="flex items-center gap-2">
        {tabs.map((tab) => (
          <div key={tab.key} className="flex items-center">
            <div
              onClick={() => onTabChange(tab.key)}
              className={`px-4 py-2 whitespace-nowrap rounded-full transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-primary text-white'
                  : 'bg-neutral-p95 border border-neutral-p80 hover:bg-neutral-p95 hover:text-white text-neutral-p80'
              }`}
            >
              <div className="flex items-center gap-2">
                <Typography
                  variant="paragraph-medium"
                  className={`${
                    activeTab === tab.key
                      ? '!text-white'
                      : '!text-text-secondary'
                  }`}
                >
                  {tab.title}
                </Typography>
                <div
                  className={`rounded-full ${
                    activeTab === tab.key
                      ? 'bg-white text-primary'
                      : 'bg-neutral-p95 border border-neutral-p80'
                  } px-2 py-0`}
                >
                  <Typography
                    variant="paragraph-medium"
                    className="!text-text-secondary"
                  >
                    {(tab.key === '1' &&
                      orderCounts
                        ?.map((item) => item.count)
                        .reduce((a, b) => Number(a) + Number(b), 0)) ||
                      orderCounts?.find((item) => item.status === tab.status)
                        ?.count ||
                      0}
                  </Typography>
                </div>
              </div>
            </div>
            {tab.key == '1' && (
              <div className="h-[40px] w-[1px] bg-border-tertiary mx-2 md:mx-4"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
