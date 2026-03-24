"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Grid, Pagination } from "antd";
import Cookies from "js-cookie";
import { getMyOrganizationList } from "@/api/organization.api";
import { useUserStore } from "@/store/user.store";
import { getOrganizationToken } from "@/api/auth.api";
import CustomButton from "@/components/Button";
import Typography from "@/components/Typography";
import { routes } from "@/constants/routing.constants";
import { IAuthOrganization } from "@/interfaces/auth/auth.response.interface";
import { OrganizationItem } from "./components/OrganizationItem";
import { OrganizationSkeleton } from "./components/OrganizationSkeleton";

const { useBreakpoint } = Grid;

export const OrganizationPage = () => {
  const router = useRouter();
  const { user } = useUserStore();
  const [page, setPage] = useState(1);
  const { setOrganization } = useUserStore();
  const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);
  const limit = 10;
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const { data: organizationData, isLoading } = useQuery({
    queryKey: ["organizations", user?.user?.uuid, page],
    queryFn: () =>
      getMyOrganizationList(user?.user?.uuid || "", { page, limit }),
    enabled: !!user?.user?.uuid,
  });

  const organizations = organizationData?.data?.organizations || [];
  const pagination = organizationData?.data?.pagination;

  const handleMenuItemClick = async (
    org: IAuthOrganization,
    action: string,
  ) => {
    setOpenPopoverId(null);
    setOrganization({
      ...org.organization,
      organizeUuid: org.organization.uuid,
      organizationDetail: org,
    } as any);
    Cookies.set("organizationId", org.organization.id.toString());
    Cookies.set("organizeUuid", org.organization.uuid);

    // Fetch and store organization token
    try {
      const res = await getOrganizationToken(
        org.organization.id,
        user?.user?.id || 0,
      );
      if (res?.data?.accessToken) {
        Cookies.set("organizationToken", res.data.accessToken);
      }
    } catch (error) {
      console.error("Failed to get organization token:", error);
    }

    switch (action) {
      case "info":
        router.push(
          `${routes.organizationDetail(org.organization.id)}?tab=orgManagement`,
        );
        break;
      case "members":
        router.push(
          `${routes.organizationDetail(org.organization.id)}?tab=member`,
        );
        break;
      case "roles":
        router.push(
          `${routes.organizationDetail(org.organization.id)}?tab=rolesPermissions`,
        );
        break;
      case "stores":
        router.push(
          `${routes.organizationDetail(org.organization.id)}?tab=storeManagement`,
        );
        break;
      case "phones":
        router.push(
          `${routes.organizationDetail(org.organization.id)}?tab=telManagement`,
        );
        break;
    }
  };

  return (
    <div className="bg-background-secondary min-h-screen py-6 md:py-10">
      <div className="container mx-auto px-4 md:px-0">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 md:mb-[48px] gap-4">
          <div className="flex flex-col gap-1">
            <div>
              <CustomButton
                variant="link"
                className="!px-0"
                icon={<i className="ri-arrow-left-line" />}
                color="neutral"
                onClick={() => router.push(routes.home())}
              >
                ย้อนกลับ
              </CustomButton>
            </div>
            <Typography variant="h3">องค์กรของคุณ</Typography>
            <Typography
              variant="paragraph-middle-regular"
              className="!text-text-tertiary"
            >
              จัดการข้อมูลองค์กรที่คุณเป็นสมาชิกหรือเป็นผู้สร้าง
              และตรวจสอบสิทธิ์การเข้าถึง
            </Typography>
          </div>
          <CustomButton
            variant="solid"
            color="primary"
            className="md:w-auto"
            onClick={() => {
              router.push(routes.organizationCreate());
            }}
          >
            สร้างองค์กรใหม่
          </CustomButton>
        </div>

        {/* Table Headers - Desktop only */}
        <div className="hidden md:grid grid-cols-[1.5fr_1fr_1.2fr_1fr_1.2fr_48px] gap-4 px-4 mb-3">
          <Typography
            variant="paragraph-middle-regular"
            className="!text-text-quinary"
          >
            ชื่อองค์กร
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
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <OrganizationSkeleton key={`skeleton-${index}`} />
            ))
          ) : organizations && organizations.length > 0 ? (
            organizations.map((item: IAuthOrganization) => (
              <OrganizationItem
                key={item.organization?.id}
                item={item}
                onMenuItemClick={handleMenuItemClick}
              />
            ))
          ) : (
            <div className="bg-white rounded-2xl p-12 flex flex-col items-center justify-center gap-4 border border-dashed border-neutral-200">
              <i className="ri-building-line text-4xl text-neutral-300" />
              <Typography
                variant="paragraph-middle-regular"
                className="!text-text-tertiary"
              >
                ไม่พบข้อมูลองค์กร
              </Typography>
            </div>
          )}
        </div>

        {/* Footer / Pagination */}
        <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-4 px-2">
          <div
            className={`flex justify-between ${isMobile ? "w-full" : ""} items-center gap-4`}
          >
            {isMobile && (
              <div
                className={`w-10 h-10 flex items-center justify-center border rounded-lg cursor-pointer ${page === 1 ? "!opacity-50 !cursor-not-allowed !pointer-events-none" : ""}`}
                onClick={() => setPage(page - 1)}
              >
                <i className="ri-arrow-left-s-line text-xl"></i>
              </div>
            )}
            <Typography
              variant="paragraph-small-regular"
              className="!text-text-secondary"
            >
              ทั้งหมด {pagination?.totalOrganizations || 0} รายการ
            </Typography>
            {isMobile && (
              <div
                className={`w-10 h-10 flex items-center justify-center border rounded-lg cursor-pointer ${!pagination?.hasNext ? "!opacity-50 !cursor-not-allowed !pointer-events-none" : ""}`}
                onClick={() => setPage(page + 1)}
              >
                <i className="ri-arrow-right-s-line text-xl"></i>
              </div>
            )}
          </div>
          {!isMobile && (
            <Pagination
              current={page}
              total={pagination?.totalOrganizations || 0}
              pageSize={limit}
              onChange={(p) => setPage(p)}
              showSizeChanger={false}
              itemRender={(_, type, originalElement) => {
                if (type === "prev") {
                  return (
                    <div className="flex items-center justify-center h-8 w-8 text-neutral-400 hover:text-primary transition-colors">
                      <i className="ri-arrow-left-s-line text-xl" />
                    </div>
                  );
                }
                if (type === "next") {
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
};

export default OrganizationPage;
