import { OrganizationTypes } from '@/common/enum/organization.enum';
import Button from '@/components/Button';
import { EmptyStateComponent } from '@/components/EmptyState';
import Typography from '@/components/Typography';

interface StepFileInfoProps {
  fileInfoData: any;
  onEdit: () => void;
  onAdd: () => void;
  isDisabled: boolean;
  juristicType?: OrganizationTypes;
}

const StepFileInfo = ({
  fileInfoData,
  onEdit,
  onAdd,
  isDisabled,
  juristicType = OrganizationTypes.PERSONAL,
}: StepFileInfoProps) => {
  const renderFileNames = (files: any[]) => {
    if (!files || files.length === 0) return '-';
    return files.map((file: any) => file.fileName).join(', ');
  };

  return (
    <div className="">
      <div className="p-4 bg-white rounded-t-xl border border-border-primary">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded flex items-center justify-center bg-primary-hover">
              <i className="ri-file-text-line text-xl text-primary"></i>
            </div>
            <Typography
              variant="paragraph-medium"
              className="!text-text-primary !font-semibold"
            >
              เอกสารการยืนยันตัวตน
            </Typography>
          </div>
          {fileInfoData && (
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
        {!fileInfoData ? (
          <EmptyStateComponent
            descriptionNode={
              <div className="flex flex-col items-center gap-1">
                <Typography
                  variant="paragraph-medium"
                  className="!text-text-primary"
                >
                  ยังไม่ได้อัปโหลดเอกสาร
                </Typography>
                <Typography
                  variant="paragraph-medium"
                  className="!text-text-quinary"
                >
                  แนบหนังสือรับรองบริษัท ภพ.20 หรือเอกสารอื่น ๆ ตามที่กำหนด
                </Typography>
                <Button variant="outlined" className="mt-2" onClick={onAdd}>
                  เพิ่มเอกสาร
                </Button>
              </div>
            }
          />
        ) : (
          <>
            {juristicType === OrganizationTypes.PERSONAL && (
              <div className="flex flex-col gap-4 md:gap-6">
                <div className="flex flex-col md:flex-row gap-4 md:gap-0">
                  <div className="w-full md:w-1/2 pr-4 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                      ellipsis
                      ellipsisOptions={{ rows: 1, expandable: false }}
                    >
                      สำเนาบัตรประจำตัวประชาชน
                      หรือสำเนาหนังสือเดินทางของผู้ประกอบการ/ผู้มีอำนาจฯ
                      พร้อมรับรองสำเนาถูกต้อง
                    </Typography>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-tertiary"
                    >
                      {renderFileNames(
                        fileInfoData?.COPY_OF_ID_OR_PASSPORT_AUTHORIZED_PERSON ||
                          []
                      )}
                    </Typography>
                  </div>
                  <div className="w-full md:w-1/2 pr-4 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                      ellipsis
                      ellipsisOptions={{ rows: 1, expandable: false }}
                    >
                      สำเนาทะเบียนบ้านของผู้ประกอบการ/ผู้มีอำนาจฯ
                      พร้อมรับรองสำเนาถูกต้อง
                    </Typography>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-tertiary"
                    >
                      {renderFileNames(
                        fileInfoData?.COPY_OF_HOUSE_REGISTRATION_AUTHORIZED_PERSON ||
                          []
                      )}
                    </Typography>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 md:gap-0">
                  <div className="w-full pr-4 md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                      ellipsis
                      ellipsisOptions={{ rows: 1, expandable: false }}
                    >
                      รูปถ่ายของผู้ประกอบการคู่กับบัตรประชาชน
                    </Typography>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-tertiary"
                    >
                      {renderFileNames(fileInfoData?.ID_CARD_WITH_PERSON || [])}
                    </Typography>
                  </div>
                  <div className="w-full pr-4 md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                      ellipsis
                      ellipsisOptions={{ rows: 1, expandable: false }}
                    >
                      รูปถ่ายสถานที่ประกอบกิจการ
                    </Typography>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-tertiary"
                    >
                      {renderFileNames(
                        fileInfoData?.PHOTO_OF_COMPANY_OR_PROJECT || []
                      )}
                    </Typography>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 md:gap-0">
                  <div className="w-full md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                      ellipsis
                      ellipsisOptions={{ rows: 1, expandable: false }}
                    >
                      สำเนาหน้าสมุดบัญชีธนาคารที่ใช้ในการรับเงิน
                    </Typography>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-tertiary"
                    >
                      {renderFileNames(
                        fileInfoData?.COPY_OF_BANK_ACCOUNT_RECEIVING_PAYMENTS ||
                          []
                      )}
                    </Typography>
                  </div>
                </div>
              </div>
            )}
            {juristicType === OrganizationTypes.REGISTERED_INDIVIDUAL && (
              <div className="flex flex-col gap-4 md:gap-6">
                <div className="flex flex-col md:flex-row gap-4 md:gap-0">
                  <div className="w-full pr-4 md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                      ellipsis
                      ellipsisOptions={{ rows: 1, expandable: false }}
                    >
                      สำเนาบัตรประจำตัวประชาชน
                      หรือสำเนาหนังสือเดินทางของผู้ประกอบการ/ผู้มีอำนาจฯ
                      พร้อมรับรองสำเนาถูกต้อง
                    </Typography>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-tertiary"
                    >
                      {renderFileNames(
                        fileInfoData?.COPY_OF_ID_OR_PASSPORT_AUTHORIZED_PERSON ||
                          []
                      )}
                    </Typography>
                  </div>
                  <div className="w-full pr-4 md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                      ellipsis
                      ellipsisOptions={{ rows: 1, expandable: false }}
                    >
                      สำเนาทะเบียนบ้านของผู้ประกอบการ/ผู้มีอำนาจฯ
                      พร้อมรับรองสำเนาถูกต้อง
                    </Typography>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-tertiary"
                    >
                      {renderFileNames(
                        fileInfoData?.COPY_OF_HOUSE_REGISTRATION_AUTHORIZED_PERSON ||
                          []
                      )}
                    </Typography>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 md:gap-0">
                  <div className="w-full pr-4 md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                      ellipsis
                      ellipsisOptions={{ rows: 1, expandable: false }}
                    >
                      สำเนาใบทะเบียนพาณิชย์ ที่มีชื่อของนิติบุคคล
                      พร้อมรับรองสำเนาถูกต้อง และประทับตราสำคัญของนิติบุคคล
                    </Typography>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-tertiary"
                    >
                      {renderFileNames(
                        fileInfoData?.COPY_OF_COMPANY_REGISTRATION || []
                      )}
                    </Typography>
                  </div>
                  <div className="w-full md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                    >
                      รูปถ่ายสถานที่ประกอบกิจการ
                    </Typography>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-tertiary"
                    >
                      {renderFileNames(
                        fileInfoData?.PHOTO_OF_COMPANY_OR_PROJECT || []
                      )}
                    </Typography>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 md:gap-0">
                  <div className="w-full md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                    >
                      สำเนาหน้าสมุดบัญชีธนาคารที่ใช้ในการรับเงิน
                    </Typography>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-tertiary"
                    >
                      {renderFileNames(
                        fileInfoData?.COPY_OF_BANK_ACCOUNT_RECEIVING_PAYMENTS ||
                          []
                      )}
                    </Typography>
                  </div>
                </div>
              </div>
            )}
            {juristicType === OrganizationTypes.JURISTIC && (
              <div className="flex flex-col gap-4 md:gap-6">
                <div className="flex flex-col md:flex-row gap-4 md:gap-0">
                  <div className="w-full pr-4 md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                      ellipsis
                      ellipsisOptions={{ rows: 1, expandable: false }}
                    >
                      สำเนาบัตรประจำตัวประชาชน
                      หรือสำเนาหนังสือเดินทางของผู้ประกอบการ/ผู้มีอำนาจฯ
                      พร้อมรับรองสำเนาถูกต้อง
                    </Typography>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-tertiary"
                    >
                      {renderFileNames(
                        fileInfoData?.COPY_OF_ID_OR_PASSPORT_AUTHORIZED_PERSON ||
                          []
                      )}
                    </Typography>
                  </div>
                  <div className="w-full pr-4 md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                      ellipsis
                      ellipsisOptions={{ rows: 1, expandable: false }}
                    >
                      สำเนาทะเบียนบ้านของผู้ประกอบการ/ผู้มีอำนาจฯ
                      พร้อมรับรองสำเนาถูกต้อง
                    </Typography>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-tertiary"
                    >
                      {renderFileNames(
                        fileInfoData?.COPY_OF_HOUSE_REGISTRATION_AUTHORIZED_PERSON ||
                          []
                      )}
                    </Typography>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 md:gap-0">
                  <div className="w-full pr-4 md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                      ellipsis
                      ellipsisOptions={{ rows: 1, expandable: false }}
                    >
                      สำเนาใบทะเบียนพาณิชย์ ที่มีชื่อของนิติบุคคล
                      พร้อมรับรองสำเนาถูกต้อง และประทับตราสำคัญของนิติบุคคล
                    </Typography>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-tertiary"
                    >
                      {renderFileNames(
                        fileInfoData?.COPY_OF_COMPANY_REGISTRATION || []
                      )}
                    </Typography>
                  </div>
                  <div className="w-full md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                    >
                      รูปถ่ายสถานที่ประกอบกิจการ
                    </Typography>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-tertiary"
                    >
                      {renderFileNames(
                        fileInfoData?.PHOTO_OF_COMPANY_OR_PROJECT || []
                      )}
                    </Typography>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 md:gap-0">
                  <div className="w-full md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                    >
                      สำเนาหน้าสมุดบัญชีธนาคารที่ใช้ในการรับเงิน
                    </Typography>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-tertiary"
                    >
                      {renderFileNames(
                        fileInfoData?.COPY_OF_BANK_ACCOUNT_RECEIVING_PAYMENTS ||
                          []
                      )}
                    </Typography>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StepFileInfo;
