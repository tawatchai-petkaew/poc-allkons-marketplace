"use client";

import CustomButton from "@/components/Button";
import BadgeLabel from "@/components/BadgeLabel";
import Typography from "@/components/Typography";
import { useTab } from "@/hooks/useTab";
import { useUserStore } from "@/store/user.store";
import { Grid } from "antd";
import ProfileKycForm from "./components/ProfileKycForm";

enum TabType {
  PROFILE_KYC = "profileKyc",
  CHANGE_PASSWORD = "changePassword",
}

const tabList = [
  {
    key: TabType.PROFILE_KYC,
    label: "โปรไฟล์ของฉัน",
    icon: <i className="ri-user-line"></i>,
  },
  {
    key: TabType.CHANGE_PASSWORD,
    label: "เปลี่ยนรหัสผ่าน",
    icon: <i className="ri-lock-password-line"></i>,
  },
];

const renderLabelByStatus = (status: string) => {
  switch (status) {
    case "NONE":
      return (
        <BadgeLabel
          prefix={<i className="ri-information-line text-error"></i>}
          variant="ghost"
          color="error"
          text="ยังไม่ยืนยันตัวตน"
          rounding="pill"
        />
      );
    case "WAIT_FOR_APPROVE":
      return (
        <BadgeLabel
          prefix={<i className="ri-information-line text-warning"></i>}
          variant="ghost"
          color="warning"
          text="รอการอนุมัติ"
          rounding="pill"
        />
      );
    case "REQUEST_MORE":
      return (
        <BadgeLabel
          prefix={<i className="ri-draft-line text-info"></i>}
          variant="ghost"
          color="info"
          text="ขอข้อมูลเพิ่มเติม"
          rounding="pill"
        />
      );
    case "APPROVE":
      return (
        <BadgeLabel
          prefix={<i className="ri-verified-badge-line text-success"></i>}
          variant="ghost"
          color="success"
          text="ยืนยันตัวตนแล้ว"
          rounding="pill"
        />
      );
    case "REJECT":
      return (
        <BadgeLabel
          prefix={<i className="ri-close-line text-error"></i>}
          variant="ghost"
          color="error"
          text="ไม่ได้รับการอนุมัติ"
          rounding="pill"
        />
      );
    default:
      return (
        <BadgeLabel
          prefix={<i className="ri-information-line text-error"></i>}
          variant="ghost"
          color="error"
          text="ยังไม่ยืนยันตัวตน"
          rounding="pill"
        />
      );
  }
};

const UserPage = () => {
  const { md } = Grid.useBreakpoint();
  const isTablet = !md;
  const { user, organization } = useUserStore();
  const { activeTab, handleTabChange } = useTab<TabType>(
    "tab",
    TabType.PROFILE_KYC,
    Object.values(TabType),
  );

  return (
    <div className="bg-background-secondary mb-[88px] min-h-[calc(100vh_-_88px)]">
      <div className="container mx-auto p-4 md:px-0 py-6">
        <div className="flex flex-col gap-1">
          <div className="flex flex-col sm:flex-row gap-1 md:gap-3 h-full items-start md:items-center">
            <Typography variant="page-title">{user?.user?.name}</Typography>
            {renderLabelByStatus(user?.user.kycStatus || "NONE")}
          </div>
        </div>
      </div>
      <div className="container bg-white md:bg-background-secondary mx-auto flex flex-col md:flex-row gap-4 md:gap-8 rounded-xl md:rounded-none md:shadow-none p-0">
        {isTablet ? (
          <div className="px-3 flex gap-2 overflow-y-auto border-b border-b-border-primary p-4 sticky top-0 z-20 bg-white">
            {tabList.map((tab) => (
              <div key={tab.key}>
                <CustomButton
                  variant={activeTab === tab.key ? "solid" : "outlined"}
                  className="flex-1"
                  onClick={() => handleTabChange(tab.key)}
                  color={activeTab === tab.key ? "primary" : "neutral"}
                  rounding="full"
                  bold="400"
                >
                  <div className="flex items-center justify-center">
                    {tab.icon}
                    <span className="ml-2">{tab.label}</span>
                  </div>
                </CustomButton>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2 w-[300px] bg-white h-fit sticky top-4 rounded-xl p-4">
            {tabList.map((tab) => (
              <div
                key={tab.key}
                className={`w-full rounded-xl py-3 px-4 cursor-pointer transition-colors ${
                  activeTab === tab.key
                    ? "bg-primary"
                    : "bg-white hover:bg-primary/10"
                }`}
                onClick={() => handleTabChange(tab.key)}
              >
                <Typography
                  variant="paragraph-small"
                  className={`${
                    activeTab === tab.key ? "!text-white" : "!text-text-primary"
                  }`}
                >
                  {tab.icon}
                  <span className="ml-1">{tab.label}</span>
                </Typography>
              </div>
            ))}
          </div>
        )}

        <div className="w-full md:w-[calc(100%_-_332px)] px-4 md:px-0">
          {activeTab === TabType.PROFILE_KYC && <ProfileKycForm />}
          {activeTab === TabType.CHANGE_PASSWORD && (
            <Typography variant="paragraph-medium">เปลี่ยนรหัสผ่าน</Typography>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPage;
