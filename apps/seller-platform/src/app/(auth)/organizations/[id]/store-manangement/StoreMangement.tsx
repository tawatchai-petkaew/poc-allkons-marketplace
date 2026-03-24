'use client';

import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { Grid } from 'antd';
import { getMerchantByOrganization } from '@/api/merchant.api';
import { useUserStore } from '@/store/user.store';
import { IMerchantItem } from '@/interfaces/merchant/merchant.response.interface';
import CustomButton from '@/components/Button';
import Typography from '@/components/Typography';
import { StoreItem } from './components/MerchantItem';
import { StoreSkeleton } from './components/MerchantSkeleton';
import { MerchantDetail } from './components/MerchantDetail';

const { useBreakpoint } = Grid;

export default function StoreMangement() {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const params = useParams();
  const orgId = params?.id as string;
  const organization = useUserStore((state) => state.organization);
  const organizeUuid = organization?.organizeUuid ?? orgId ?? '';

  const [selectedStore, setSelectedStore] = useState<IMerchantItem | null>(null);

  const { data: merchantData, isLoading } = useQuery({
    queryKey: ['getMerchantByOrganization', organizeUuid],
    queryFn: () => getMerchantByOrganization(organizeUuid),
    enabled: !!organizeUuid,
  });

  const merchants: IMerchantItem[] = merchantData?.data ?? [];

  const handleMenuItemClick = useCallback((store: IMerchantItem, action: string) => {
    if (action === 'info') setSelectedStore(store);
  }, []);

  const handleBack = useCallback(() => setSelectedStore(null), []);

  if (selectedStore) {
    return <MerchantDetail store={selectedStore} onBack={handleBack} />;
  }

  return (
    <div className="py-3 flex flex-col gap-4">
      {/* Section header */}
      <div className="flex items-end justify-between w-full">
        <div>
          <Typography variant="h5" className="!text-text-secondary">
            ร้านค้าและสาขา
          </Typography>
          <Typography variant="paragraph-middle-regular" className="!text-text-quarternary">
            ร้านค้าและสาขาภายใต้องค์กร
          </Typography>
        </div>
        <CustomButton icon={<i className="ri-add-line"></i>}>เพิ่มสาขา</CustomButton>
      </div>

      {/* Column headers — desktop only */}
      {!isMobile && (
        <div className="grid grid-cols-[2fr_1fr_1fr_48px] gap-4 px-4 mt-3">
          <Typography variant="paragraph-middle-regular" className="!text-text-quinary">
            ชื่อร้านค้าและสาขา
          </Typography>
          <Typography variant="paragraph-middle-regular" className="!text-text-quinary">
            จำนวนสมาชิก
          </Typography>
          <Typography variant="paragraph-middle-regular" className="!text-text-quinary">
            สถานะร้านค้า
          </Typography>
          <div />
        </div>
      )}

      {/* List */}
      <div className="flex flex-col gap-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <StoreSkeleton key={`skeleton-${i}`} />)
        ) : merchants.length > 0 ? (
          merchants.map((item) => (
            <StoreItem
              key={item.uuid ?? item.slug}
              item={item}
              onMenuItemClick={handleMenuItemClick}
            />
          ))
        ) : (
          <div className="bg-white rounded-2xl p-12 flex flex-col items-center justify-center gap-4 border border-dashed border-neutral-200">
            <i className="ri-store-2-line text-4xl text-neutral-300" />
            <Typography variant="paragraph-middle-regular" className="!text-text-tertiary">
              ไม่พบข้อมูลร้านค้าและสาขา
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
}
