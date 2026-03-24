"use client";

import React from "react";
import { useRouter } from "next/navigation";

import Typography from "@/components/Typography";
import Button from "@/components/Button";

const StartupPartnerLanding: React.FC = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center">
      <div className="max-w-[600px] w-full p-8">
        <div className="text-center mb-8">
          <Typography variant="h2" className="!text-text-primary">
            Startup Partner Center
          </Typography>
          <Typography variant="paragraph-medium" className="!text-text-tertiary !mt-2">
            ระบบจัดการ Startup Partner — Design Mocks
          </Typography>
        </div>

        <div className="flex flex-col gap-4">
          {/* SP Flow Pages */}
          <div className="bg-white border border-border-primary rounded-xl p-6">
            <Typography variant="h5" className="!mb-4">
              SP Flow (ผู้สมัคร)
            </Typography>
            <div className="flex flex-col gap-3">
              <Button
                dataTestId="btn--go-register"
                color="primary"
                fullWidth
                onClick={() => router.push("/design-mocks/sp/register")}
              >
                สมัครสมาชิกใหม่ (Register)
              </Button>
              <Button
                dataTestId="btn--go-apply"
                color="primary"
                variant="outlined"
                fullWidth
                onClick={() => router.push("/design-mocks/sp/apply")}
              >
                สมัครจากบัญชีเดิม (Apply)
              </Button>
              <Button
                dataTestId="btn--go-status"
                color="neutral"
                variant="outlined"
                fullWidth
                onClick={() => router.push("/design-mocks/sp/status")}
              >
                ดูสถานะคำขอ (Status)
              </Button>
              <Button
                dataTestId="btn--go-home"
                color="neutral"
                variant="outlined"
                fullWidth
                onClick={() => router.push("/design-mocks/sp/home")}
              >
                หน้าหลัก SP (Home)
              </Button>
            </div>
          </div>

          {/* Admin Pages */}
          <div className="bg-white border border-border-primary rounded-xl p-6">
            <Typography variant="h5" className="!mb-4">
              Admin Flow (ผู้ดูแล)
            </Typography>
            <div className="flex flex-col gap-3">
              <Button
                dataTestId="btn--go-admin-list"
                color="neutral"
                fullWidth
                onClick={() => router.push("/design-mocks/admin/sp/applications")}
              >
                รายการคำขอสมัคร (Application List)
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartupPartnerLanding;
