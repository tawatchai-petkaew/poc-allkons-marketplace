import { OrganizationTypes } from '@/common/enum/organization.enum';
import Button from '@/components/Button';
import { EmptyStateComponent } from '@/components/EmptyState';
import ResponsivePopup from '@/components/Popup';
import Typography from '@/components/Typography';
import { Divider, Grid } from 'antd';
import { useState } from 'react';

interface StepOrganizationInfoProps {
  orgInfoData: any;
  juristicTypeList: any[];
  onEdit: () => void;
  onAdd: () => void;
  isDisabled: boolean;
}

const StepOrganizationInfo = ({
  orgInfoData,
  juristicTypeList,
  onEdit,
  onAdd,
  isDisabled,
}: StepOrganizationInfoProps) => {
  const [isOpenBusinessTypeInfo, setIsOpenBusinessTypeInfo] = useState(false);
  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;
  const renderBusinessType = (types: string[]) => {
    return (
      types
        .map((type) => {
          if (type === 'AGENT') {
            return 'ร้านค้าตัวแทนจําหน่าย (AGENT)';
          } else if (type === 'BIGBOX') {
            return 'ร้านค้าตัวแทนขนาดใหญ่ (BIGBOX)';
          } else if (type === 'MDT') {
            return 'ห้าง Modern trade (MDT)';
          } else if (type === 'ONL') {
            return 'ขาย Online (ONL) / SP นักขายอิสระ (SP)';
          } else if (type === 'FAC') {
            return 'ร้านค้าตัวแทนจำหน่าย (FAC)';
          }
        })
        .join(', ') || '-'
    );
  };

  return (
    <div className="">
      <div className="p-4 bg-white rounded-t-xl border border-border-primary">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded flex items-center justify-center bg-primary-hover">
              <i className="ri-building-line text-xl text-primary"></i>
            </div>
            <Typography
              variant="paragraph-medium"
              className="!text-text-primary !font-semibold"
            >
              ข้อมูลเกี่ยวกับองค์กร
            </Typography>
          </div>
          {orgInfoData && (
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
        {!orgInfoData ? (
          <EmptyStateComponent
            descriptionNode={
              <div className="flex flex-col items-center gap-1">
                <Typography
                  variant="paragraph-medium"
                  className="!text-text-primary"
                >
                  ยังไม่ได้เพิ่มข้อมูลองค์กร
                </Typography>
                <Typography
                  variant="paragraph-medium"
                  className="!text-text-quinary"
                >
                  เพิ่มชื่อ ประเภท และข้อมูลพื้นฐานขององค์กร
                </Typography>
                <Button variant="outlined" className="mt-2" onClick={onAdd}>
                  เพิ่มข้อมูลองค์กร
                </Button>
              </div>
            }
          />
        ) : (
          <div className="flex flex-col gap-4 md:gap-6">
            {/* Personal Organization */}
            {orgInfoData?.juristicType === OrganizationTypes.PERSONAL && (
              <>
                <div className="flex flex-col md:flex-row gap-4 md:gap-0">
                  <div className="w-full md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                    >
                      ประเภทองค์กร
                    </Typography>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-tertiary"
                    >
                      บุคคลธรรมดา
                    </Typography>
                  </div>
                  <div className="w-full md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                    >
                      เลขประจำตัวประชาชน
                    </Typography>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-tertiary"
                    >
                      {orgInfoData?.idCard || ''}
                    </Typography>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 md:gap-0">
                  <div className="w-full md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                    >
                      ชื่อบุคคลธรรมดา
                    </Typography>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-tertiary"
                    >
                      {orgInfoData?.organizeName || ''}
                    </Typography>
                  </div>
                  <div className="w-full md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                    >
                      ประเภทธุรกิจ
                    </Typography>
                    <div className="flex">
                      <div className="w-[calc(100%_-_70px)]">
                        <Typography
                          variant="paragraph-small"
                          className="!text-text-tertiary"
                          ellipsis={true}
                        >
                          {renderBusinessType(orgInfoData?.businessType || [])}
                        </Typography>
                      </div>
                      {(isMobile
                        ? orgInfoData?.businessType.length > 1
                        : orgInfoData?.businessType.length > 2) && (
                        <Typography
                          variant="paragraph-small"
                          className="!text-icon-brand-dark !w-[130px] !cursor-pointer"
                          onClick={() => {
                            setIsOpenBusinessTypeInfo(true);
                          }}
                        >
                          ดูทั้งหมด
                        </Typography>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 md:gap-0">
                  <div className="w-full md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                    >
                      เบอร์ติดต่อหลัก
                    </Typography>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-tertiary"
                    >
                      {orgInfoData?.mainPhoneNumber || ''}
                    </Typography>
                  </div>
                </div>
              </>
            )}

            {/* Registered Individual */}
            {orgInfoData?.juristicType ===
              OrganizationTypes.REGISTERED_INDIVIDUAL && (
              <>
                <div className="flex flex-col md:flex-row gap-4 md:gap-0">
                  <div className="w-full md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                    >
                      ประเภทองค์กร
                    </Typography>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-tertiary"
                    >
                      บุคคลธรรมดาจดทะเบียนพาณิชย์
                    </Typography>
                  </div>
                  <div className="w-full md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                    >
                      เลขทะเบียนพาณิชย์
                    </Typography>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-tertiary"
                    >
                      {orgInfoData?.registrationNumber || ''}
                    </Typography>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 md:gap-0">
                  <div className="w-full md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                    >
                      ชื่อที่ใช้ในการประกอบพาณิชกิจ
                    </Typography>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-tertiary"
                    >
                      {orgInfoData?.organizeName || ''}
                    </Typography>
                  </div>
                  <div className="w-full md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                    >
                      ประเภทธุรกิจ
                    </Typography>
                    <div className="flex">
                      <div className="w-[calc(100%_-_70px)]">
                        <Typography
                          variant="paragraph-small"
                          className="!text-text-tertiary"
                          ellipsis={true}
                        >
                          {renderBusinessType(orgInfoData?.businessType || [])}
                        </Typography>
                      </div>
                      {(isMobile
                        ? orgInfoData?.businessType.length > 1
                        : orgInfoData?.businessType.length > 2) && (
                        <Typography
                          variant="paragraph-small"
                          className="!text-icon-brand-dark !w-[130px] !cursor-pointer"
                          onClick={() => {
                            setIsOpenBusinessTypeInfo(true);
                          }}
                        >
                          ดูทั้งหมด
                        </Typography>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 md:gap-0">
                  <div className="w-full md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                    >
                      ออกให้
                    </Typography>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-tertiary"
                    >
                      {orgInfoData?.commercialName || ''}
                    </Typography>
                  </div>
                  <div className="w-full md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                    >
                      เลขประจำตัวประชาชน
                    </Typography>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-tertiary"
                    >
                      {orgInfoData?.idCard || ''}
                    </Typography>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 md:gap-0">
                  <div className="w-full md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                    >
                      เบอร์ติดต่อหลัก
                    </Typography>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-tertiary"
                    >
                      {orgInfoData?.mainPhoneNumber || ''}
                    </Typography>
                  </div>
                </div>
              </>
            )}

            {/* Juristic Organization */}
            {orgInfoData?.juristicType === OrganizationTypes.JURISTIC && (
              <>
                <div className="flex flex-col md:flex-row gap-4 md:gap-0">
                  <div className="w-full md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                    >
                      ประเภทนิติบุคคล
                    </Typography>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-tertiary"
                    >
                      {juristicTypeList?.find(
                        (item: any) => item.id === orgInfoData?.juristicTypeId
                      )?.label || ''}
                    </Typography>
                  </div>
                  <div className="w-full md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                    >
                      เลขประจำตัวนิติบุคคล
                    </Typography>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-tertiary"
                    >
                      {orgInfoData?.taxId || ''}
                    </Typography>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 md:gap-0">
                  <div className="w-full md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                    >
                      ชื่อองค์กร
                    </Typography>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-tertiary"
                    >
                      {orgInfoData?.organizeName || ''}
                    </Typography>
                  </div>
                  <div className="w-full md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                    >
                      ประเภทธุรกิจ
                    </Typography>
                    <div className="flex">
                      <div className="w-[calc(100%_-_60px)]">
                        <Typography
                          variant="paragraph-small"
                          className="!text-text-tertiary"
                          ellipsis={true}
                        >
                          {renderBusinessType(orgInfoData?.businessType || [])}
                        </Typography>
                      </div>
                      {(isMobile
                        ? orgInfoData?.businessType.length > 1
                        : orgInfoData?.businessType.length > 2) && (
                        <Typography
                          variant="paragraph-small"
                          className="!text-icon-brand-dark !w-[130px] !cursor-pointer"
                          onClick={() => {
                            setIsOpenBusinessTypeInfo(true);
                          }}
                        >
                          ดูทั้งหมด
                        </Typography>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 md:gap-0">
                  <div className="w-full md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                    >
                      ชื่อสาขา
                    </Typography>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-tertiary"
                    >
                      {orgInfoData?.branchName === 'HEAD_OFFICE' ||
                      orgInfoData?.branchNumber === '00000'
                        ? 'สำนักงานใหญ่'
                        : orgInfoData?.branchName === 'BRANCH'
                          ? 'สาขา'
                          : orgInfoData?.branchName || '-'}
                    </Typography>
                  </div>
                  <div className="w-full md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                    >
                      เลขที่สาขา
                    </Typography>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-tertiary"
                    >
                      {orgInfoData?.branchNumber || '00000'}
                    </Typography>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 md:gap-0">
                  <div className="w-full md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                    >
                      เบอร์ติดต่อหลัก
                    </Typography>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-tertiary"
                    >
                      {orgInfoData?.mainPhoneNumber || ''}
                    </Typography>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <ResponsivePopup
        visible={isOpenBusinessTypeInfo}
        onClose={() => setIsOpenBusinessTypeInfo(false)}
        modalProps={{
          width: '60vw',
        }}
        drawerProps={{
          destroyOnClose: true,
          styles: { body: { padding: '16px' } },
        }}
      >
        <div className="relative">
          <div className="absolute right-0 top-0 md:hidden justify-end">
            <Button
              variant="outlined"
              onClick={() => {
                setIsOpenBusinessTypeInfo(false);
              }}
              className="!px-0"
              color="neutral"
              bold="400"
              icon={<i className="ri-close-line text-xl text-neutral-40"></i>}
            />
          </div>
          <div className="flex justify-center ">
            <Typography variant="h4">ประเภทธุรกิจ</Typography>
          </div>
          <Divider />
          {orgInfoData?.businessType &&
            orgInfoData?.businessType.length > 0 && (
              <div className="flex flex-col">
                {orgInfoData?.businessType.map((type: any, index: number) => (
                  <Typography
                    variant={isMobile ? 'paragraph-medium' : 'paragraph-big'}
                    className="!text-text-quarternary"
                    key={index}
                  >
                    {type === 'AGENT'
                      ? 'ร้านค้าตัวแทนจําหน่าย (AGENT)'
                      : type === 'BIGBOX'
                        ? 'ร้านค้าตัวแทนขนาดใหญ่ (BIGBOX)'
                        : type === 'MDT'
                          ? 'ห้าง Modern trade (MDT)'
                          : type === 'ONL'
                            ? 'ขาย Online (ONL) / SP นักขายอิสระ (SP)'
                            : type === 'FAC'
                              ? 'ร้านค้าตัวแทนจำหน่าย (FAC)'
                              : type}
                  </Typography>
                ))}
              </div>
            )}
        </div>
      </ResponsivePopup>
    </div>
  );
};

export default StepOrganizationInfo;
