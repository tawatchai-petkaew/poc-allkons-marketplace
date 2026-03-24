'use client';

import Button from '@/components/Button';
import { EmptyStateComponent } from '@/components/EmptyState';
import Typography from '@/components/Typography';
import { Divider } from 'antd';

interface ContactDetails {
  highestAuthorityName?: string;
  highestAuthorityPosition?: string;
  highestAuthorityPhoneNumber?: string;
  highestAuthorityEmail?: string;
}

interface PrimaryContactDetails {
  contactName?: string;
  contactPhoneNumber?: string;
  contactEmail?: string;
}

interface StepContactInfoData {
  highestAuthority?: ContactDetails;
  contact?: PrimaryContactDetails;
  contactShownHighestAuthority?: boolean;
}

interface StepContactInfoProps {
  contactInfoData: StepContactInfoData | null;
  onEdit: () => void;
  onAdd: () => void;
  isDisabled: boolean;
}

const StepContactInfo = ({
  contactInfoData,
  onEdit,
  onAdd,
  isDisabled,
}: StepContactInfoProps) => {
  return (
    <div className="">
      <div className="p-4 bg-white rounded-t-xl border border-border-primary">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded flex items-center justify-center bg-primary-hover">
              <i className="ri-contacts-book-line text-xl text-primary"></i>
            </div>
            <Typography
              variant="paragraph-medium"
              className="!text-text-primary !font-semibold"
            >
              ข้อมูลการติดต่อ
            </Typography>
          </div>
          {contactInfoData && (
            <Button
              size="small"
              variant="ghost"
              icon={<i className="ri-edit-line"></i>}
              onClick={onEdit}
              disabled={isDisabled}
            >
              แก้ไข
            </Button>
          )}
        </div>
      </div>
      <div className="p-4 bg-background-primary rounded-b-xl border border-border-primary border-t-0 flex flex-col gap-4">
        {!contactInfoData ? (
          <EmptyStateComponent
            descriptionNode={
              <div className="flex flex-col items-center gap-1">
                <Typography
                  variant="paragraph-medium"
                  className="!text-text-primary"
                >
                  ยังไม่ได้เพิ่มข้อมูลผู้ติดต่อ
                </Typography>
                <Typography
                  variant="paragraph-medium"
                  className="!text-text-quinary"
                >
                  เพิ่มชื่อ เบอร์โทรศัพท์ และอีเมลของผู้ติดต่อหลัก
                </Typography>
                <Button variant="outlined" className="mt-2" onClick={onAdd}>
                  เพิ่มข้อมูลผู้ติดต่อ
                </Button>
              </div>
            }
          />
        ) : (
          <div className="flex flex-col gap-4 md:gap-6">
            <Typography
              variant="paragraph-medium"
              className="!text-text-primary !font-medium"
            >
              ข้อมูลผู้มีอำนาจในองค์กร
            </Typography>
            <div className="flex flex-col md:flex-row gap-4 md:gap-0">
              <div className="w-full md:w-1/2 flex flex-col gap-1">
                <Typography
                  variant="paragraph-small"
                  className="!text-text-primary !font-medium"
                >
                  ชื่อ-นามสกุล
                </Typography>
                <Typography
                  variant="paragraph-small"
                  className="!text-text-tertiary"
                >
                  {contactInfoData?.highestAuthority?.highestAuthorityName ||
                    ''}
                </Typography>
              </div>
              <div className="w-full md:w-1/2 flex flex-col gap-1">
                <Typography
                  variant="paragraph-small"
                  className="!text-text-primary !font-medium"
                >
                  ตำแหน่ง
                </Typography>
                <Typography
                  variant="paragraph-small"
                  className="!text-text-tertiary"
                >
                  {contactInfoData?.highestAuthority
                    ?.highestAuthorityPosition || ''}
                </Typography>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4 md:gap-0">
              <div className="w-full md:w-1/2 flex flex-col gap-1">
                <Typography
                  variant="paragraph-small"
                  className="!text-text-primary !font-medium"
                >
                  เบอร์ติดต่อ
                </Typography>
                <Typography
                  variant="paragraph-small"
                  className="!text-text-tertiary"
                >
                  {contactInfoData?.highestAuthority
                    ?.highestAuthorityPhoneNumber || ''}
                </Typography>
              </div>
              <div className="w-full md:w-1/2 flex flex-col gap-1">
                <Typography
                  variant="paragraph-small"
                  className="!text-text-primary !font-medium"
                >
                  อีเมล
                </Typography>
                <Typography
                  variant="paragraph-small"
                  className="!text-text-tertiary"
                >
                  {contactInfoData?.highestAuthority?.highestAuthorityEmail ||
                    ''}
                </Typography>
              </div>
            </div>
            <Divider className="!my-0" />
            <Typography
              variant="paragraph-medium"
              className="!text-text-primary !font-medium"
            >
              ข้อมูลผู้ติดต่อหลัก
            </Typography>
            {contactInfoData?.contactShownHighestAuthority ? (
              <>
                <Typography
                  variant="paragraph-small"
                  className="!text-text-tertiary !font-medium"
                >
                  ใช้ข้อมูลเดียวกับผู้มีอำนาจสูงสุด
                </Typography>
              </>
            ) : (
              <>
                <div className="flex flex-col md:flex-row gap-4 md:gap-0">
                  <div className="w-full md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                    >
                      ชื่อ-นามสกุล
                    </Typography>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-tertiary"
                    >
                      {contactInfoData?.contact?.contactName || ''}
                    </Typography>
                  </div>
                  <div className="w-full md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                    >
                      เบอร์ติดต่อ
                    </Typography>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-tertiary"
                    >
                      {contactInfoData?.contact?.contactPhoneNumber || ''}
                    </Typography>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 md:gap-0">
                  <div className="w-full md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                    >
                      อีเมล
                    </Typography>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-tertiary"
                    >
                      {contactInfoData?.contact?.contactEmail || ''}
                    </Typography>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StepContactInfo;
