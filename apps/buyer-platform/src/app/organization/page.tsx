'use client';

import CustomButton from '@/components/Button';
import Typography from '@/components/Typography';
import { useGlobalStore } from '@/store/global.store';
import { Pagination } from 'antd';
import { useState } from 'react';
import { OrganizationItem } from './components/OrganizationItem';
import { OrganizationSkeleton } from './components/OrganizationSkeleton';
import ResponsivePopup from '@/components/Popup';
import CreateOrganizationModal from './components/CreateOrganizationModal';
import { useScreenWidth } from '@/hooks/useScreenWidth';
import { useQuery } from '@tanstack/react-query';
import { getUserWithOrganizations } from '@/common/api/customer-service/organization.api';
import { EmptyStateComponent } from '@/components/EmptyState';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { IOrganizationWithRoleDto } from '@/common/interfaces/organization/user-with-org.response.interface';

export default function OrganizationPage() {
  const { profile, setOrganizations } = useGlobalStore();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Auto-open create modal if 'create' query parameter is present
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setIsCreateModalOpen(true);
    }
  }, [searchParams]);

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    // Remove 'create' query parameter from URL
    if (searchParams.get('create')) {
      router.push('/organization');
    }
    // Reset modal by changing key (forces remount)
    setModalKey((prev) => prev + 1);
  };

  const { data: userWithOrganizationsData, isFetching } = useQuery({
    queryKey: ['organization', profile?.uuid, currentPage],
    queryFn: async () => {
      const response = await getUserWithOrganizations(
        profile?.uuid || '',
        currentPage,
        pageSize
      );
      const apiOrgs = response?.data?.organizations || [];

      setOrganizations(apiOrgs);
      return response;
    },
    enabled: !!profile?.uuid,
  });

  const organizations = userWithOrganizationsData?.data?.organizations || [];
  const paginationData = userWithOrganizationsData?.data?.pagination;

  const screenWidth = useScreenWidth();
  const isTablet = screenWidth < 768;

  return (
    <div className="bg-background-secondary min-h-screen py-6 md:py-10">
      <ResponsivePopup
        visible={isCreateModalOpen}
        onClose={handleCloseModal}
        modalProps={{ width: screenWidth < 1280 ? '80vw' : '60vw' }}
        modalTitle={
          <div
            className={`flex justify-between items-end py-6 ${screenWidth < 1280 ? 'px-4' : 'px-5'}`}
          >
            <div>
              <Typography variant="h4">เพิ่มองค์กรใหม่</Typography>
              <Typography
                variant="paragraph-middle-regular"
                className="!text-text-tertiary"
              >
                ข้อมูลส่วนตัว
              </Typography>
            </div>
          </div>
        }
        drawerTitle={
          <div
            className={`flex justify-between items-end py-6 ${screenWidth < 1280 ? 'px-4' : 'px-5'}`}
          >
            <div>
              <Typography variant="h4">เพิ่มองค์กรใหม่</Typography>
              <Typography
                variant="paragraph-middle-regular"
                className="!text-text-tertiary"
              >
                ข้อมูลส่วนตัว
              </Typography>
            </div>
          </div>
        }
      >
        <CreateOrganizationModal
          key={modalKey}
          onClose={handleCloseModal}
          organizations={organizations}
        />
      </ResponsivePopup>
      <div className="container mx-auto px-4 md:px-0">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 md:mb-[48px] gap-4">
          <div className="flex flex-col gap-1">
            <Typography variant="page-title">โปรไฟล์ธุรกิจ</Typography>
            <Typography
              variant="paragraph-middle-regular"
              className="!text-text-tertiary"
            >
              จัดการข้อมูลโปรไฟล์ธุรกิจที่คุณเป็นสมาชิกหรือเป็นผู้สร้าง
            </Typography>
          </div>
          <CustomButton
            onClick={() => {
              setIsCreateModalOpen(true);
            }}
            className="md:w-auto"
          >
            สร้างองค์กรใหม่
          </CustomButton>
        </div>

        {/* Table Headers */}
        <div className="hidden md:grid grid-cols-[1.5fr_1fr_1.2fr_1fr_1.2fr_48px] gap-4 px-4 mb-3">
          <Typography
            variant="paragraph-middle-regular"
            className="!text-text-quinary"
          >
            ชื่อโปรไฟล์ธุรกิจ
          </Typography>
          <Typography
            variant="paragraph-middle-regular"
            className="!text-text-quinary"
          >
            บทบาท
          </Typography>
          <Typography
            variant="paragraph-middle-regular"
            className="!text-text-quinary"
          >
            ประเภทการเป็นสมาชิก
          </Typography>
          <Typography
            variant="paragraph-middle-regular"
            className="!text-text-quinary text-center"
          >
            จำนวนสมาชิก (ผู้ใช้)
          </Typography>
          <Typography
            variant="paragraph-middle-regular"
            className="!text-text-quinary text-center"
          >
            สถานะยืนยันตัวตนองค์กร
          </Typography>
          <div></div>
        </div>

        {/* Rows */}
        <div className="flex flex-col gap-4">
          {isFetching ? (
            // Show skeletons while loading
            Array.from({ length: 3 }).map((_, index) => (
              <OrganizationSkeleton key={`skeleton-${index}`} />
            ))
          ) : organizations && organizations.length > 0 ? (
            // Show actual data when loaded
            organizations.map((item: IOrganizationWithRoleDto) => (
              <OrganizationItem key={item.organization?.id} item={item} />
            ))
          ) : (
            // Show empty state when no data
            <div className="bg-white rounded-2xl p-12 flex flex-col items-center justify-center gap-4 border border-dashed border-neutral-200">
              <EmptyStateComponent
                descriptionNode={'ไม่พบข้อมูลโปรไฟล์ธุรกิจ'}
              />
            </div>
          )}
        </div>

        {/* Footer / Pagination */}
        <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-4 px-2">
          <div
            className={`flex justify-between ${isTablet ? 'w-full' : ''} items-center gap-4`}
          >
            {isTablet && (
              <div
                className={`w-10 h-10 flex items-center justify-center border rounded-lg cursor-pointer ${currentPage === 1 ? '!opacity-50 !cursor-not-allowed !pointer-events-none' : ''}`}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <i className="ri-arrow-left-s-line text-xl"></i>
              </div>
            )}
            <Typography
              variant="paragraph-small-regular"
              className="!text-text-secondary"
            >
              ทั้งหมด {paginationData?.totalOrganizations || 0} รายการ
            </Typography>
            {isTablet && (
              <div
                className={`w-10 h-10 flex items-center justify-center border rounded-lg cursor-pointer ${!paginationData?.hasNext ? '!opacity-50 !cursor-not-allowed !pointer-events-none' : ''}`}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <i className="ri-arrow-right-s-line text-xl"></i>
              </div>
            )}
          </div>
          {!isTablet && (
            <Pagination
              current={currentPage}
              total={paginationData?.totalOrganizations || 0}
              pageSize={pageSize}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
              itemRender={(_, type, originalElement) => {
                if (type === 'prev') {
                  return (
                    <div className="flex items-center justify-center h-8 w-8 text-neutral-400 hover:text-primary transition-colors">
                      <i className="ri-arrow-left-s-line text-xl" />
                    </div>
                  );
                }
                if (type === 'next') {
                  return (
                    <div className="flex items-center justify-center h-8 w-8 text-neutral-400 hover:text-primary transition-colors">
                      <i className="ri-arrow-right-s-line text-xl" />
                    </div>
                  );
                }
                return originalElement;
              }}
              className="custom-pagination"
            />
          )}
        </div>
      </div>
    </div>
  );
}
