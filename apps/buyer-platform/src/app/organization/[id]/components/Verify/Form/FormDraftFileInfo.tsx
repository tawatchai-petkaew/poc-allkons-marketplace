import { OrganizationTypes } from '@/common/enum/organization.enum';
import Button from '@/components/Button';
import Typography from '@/components/Typography';
import { Alert, Divider, Form, FormInstance, Grid, UploadFile } from 'antd';
import { useEffect, useState } from 'react';
import UploadFileDragger from '../../UploadFileCis';
import { DocumentType } from '@/common/enum/document.enum';
import { useOrganizationKycStore } from '@/store/organization-kyc.store';

interface FormDraftFileInfoProps {
  onClose: () => void;
  form: FormInstance;
  onFinish?: (values: any) => void;
  orgType?: string;
  draftOrganizeId: number;
  isInPopup?: boolean;
  onSaveDraft?: () => void;
  isLoadingSaveDraft?: boolean;
}

type FileValues = {
  COPY_OF_ID_OR_PASSPORT_AUTHORIZED_PERSON: UploadFile[];
  COPY_OF_HOUSE_REGISTRATION_AUTHORIZED_PERSON: UploadFile[];
  ID_CARD_WITH_PERSON: UploadFile[];
  POWER_OF_ATTORNEY: UploadFile[];
  COPY_OF_ID_OR_PASSPORT_ATTORNEY_GIVER: UploadFile[];
  COPY_OF_COMPANY_REGISTRATION: UploadFile[];
  COPY_OF_VAT_REGISTRATION: UploadFile[];
  TRADEMARK: UploadFile[];
  PHOTO_OF_COMPANY_OR_PROJECT: UploadFile[];
  COPY_OF_CERTIFIED_COMMERCIAL_REGISTRATION_WITH_SEAL: UploadFile[];
  COPY_OF_BANK_ACCOUNT_RECEIVING_PAYMENTS: UploadFile[];
  OTHERS: UploadFile[];
};

const FormDraftFileInfo = ({
  onClose,
  form,
  onFinish,
  orgType,
  draftOrganizeId,
  isInPopup = true,
  onSaveDraft,
  isLoadingSaveDraft = false,
}: FormDraftFileInfoProps) => {
  const [files, setFiles] = useState<FileValues>({
    COPY_OF_ID_OR_PASSPORT_AUTHORIZED_PERSON: [],
    COPY_OF_HOUSE_REGISTRATION_AUTHORIZED_PERSON: [],
    ID_CARD_WITH_PERSON: [],
    POWER_OF_ATTORNEY: [],
    COPY_OF_ID_OR_PASSPORT_ATTORNEY_GIVER: [],
    COPY_OF_COMPANY_REGISTRATION: [],
    COPY_OF_VAT_REGISTRATION: [],
    TRADEMARK: [],
    PHOTO_OF_COMPANY_OR_PROJECT: [],
    COPY_OF_CERTIFIED_COMMERCIAL_REGISTRATION_WITH_SEAL: [],
    COPY_OF_BANK_ACCOUNT_RECEIVING_PAYMENTS: [],
    OTHERS: [],
  });

  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;
  const { isUploadFileCis } = useOrganizationKycStore();

  useEffect(() => {
    const formValues = form.getFieldsValue();
    const convertedFiles: Partial<FileValues> = {};

    Object.keys(formValues).forEach((key) => {
      if (formValues[key] && Array.isArray(formValues[key])) {
        convertedFiles[key as keyof FileValues] = formValues[key].map(
          (file: any, index: number) => ({
            uid: file.documentCisId || `${key}-${index}`,
            name: file.fileName || `file-${index}`,
            status: 'done',
            url: file.filePath,
            type: file.fileType,
            size: file.fileSize,
            response: {
              documentCisId: file.documentCisId,
              fileName: file.fileName,
              fileType: file.fileType,
              filePath: file.filePath,
              fileSize: file.fileSize,
            },
          })
        );
      }
    });

    setFiles((prev) => ({
      ...prev,
      ...convertedFiles,
    }));
  }, [form]);

  return (
    <Form
      layout="vertical"
      className="relative"
      form={form}
      scrollToFirstError
      onFinish={onFinish}
    >
      {isInPopup && (
        <div className="flex md:hidden justify-end">
          <Button
            onClick={onClose}
            variant="outlined"
            className="!px-0"
            color="neutral"
            bold="400"
            icon={<i className="ri-close-line text-xl text-neutral-40"></i>}
          />
        </div>
      )}
      <div
        style={
          isInPopup
            ? {
                marginTop: isMobile ? '0' : '24px',
                maxHeight: isMobile ? 'auto' : '564px',
                overflowY: isMobile ? 'visible' : 'auto',
                paddingBottom: '70px',
              }
            : {
                paddingBottom: '70px',
              }
        }
      >
        <div>
          <Typography variant="paragraph-big" className="!text-text-primary">
            ขั้นตอนที่ 4 : เอกสารยืนยันตัวตน
          </Typography>
        </div>
        <Alert
          message={
            <div className="flex gap-2">
              <i className="ri-file-text-line text-xl text-warning"></i>
              <div className="flex flex-col">
                <Typography variant="paragraph-small">
                  *เอกสารสำเนาต้องเซ็นรับรองสำเนาถูกต้องเท่านั้น
                </Typography>
                <Typography variant="paragraph-small">
                  *รูปถ่ายบัตรประชาชน และลายเซ็นอิเล็กทรอนิกส์ไม่สามารถใช้ได้
                </Typography>
                <Typography variant="paragraph-small">
                  *เพิ่มได้ไม่เกิน 6 ไฟล์ ต่อ 1 เอกสาร
                </Typography>
              </div>
            </div>
          }
          type="warning"
          className="!mt-4"
        />
        <div className="flex flex-col mt-4">
          <Typography
            variant="paragraph-big"
            className="!text-text-primary !font-medium"
          >
            เอกสารระบุตัวตน
          </Typography>
          <Typography
            variant="paragraph-medium"
            className="!text-text-quarternary"
          >
            ใช้เพื่อยืนยันตัวตนของผู้มีอำนาจในการดำเนินธุรกิจ
            และยืนยันสิทธิ์ในการลงนามแทนกิจการ
          </Typography>
        </div>
        <Divider className="!my-3" />
        <div className="p-6 border border-border-primary rounded-xl flex flex-col gap-6">
          <Form.Item
            name="COPY_OF_ID_OR_PASSPORT_AUTHORIZED_PERSON"
            rules={[
              {
                required: true,
                message:
                  'กรุณาแนบไฟล์สำเนาบัตรประชาชน หรือสำเนาหนังสือเดินทางของผู้ประกอบการ/ผู้มีอำนาจฯ พร้อมรับรองสำเนาถูกต้อง',
              },
            ]}
            className="!mb-0"
          >
            <UploadFileDragger
              label="1. สำเนาบัตรประจำตัวประชาชน หรือสำเนาหนังสือเดินทางของผู้ประกอบการ/ผู้มีอำนาจฯ พร้อมรับรองสำเนาถูกต้อง"
              file={files.COPY_OF_ID_OR_PASSPORT_AUTHORIZED_PERSON}
              setFile={(files) =>
                setFiles((prev) => ({
                  ...prev,
                  COPY_OF_ID_OR_PASSPORT_AUTHORIZED_PERSON: files,
                }))
              }
              form={{
                key: 'COPY_OF_ID_OR_PASSPORT_AUTHORIZED_PERSON',
                formInstance: form,
              }}
              acceptedTypes={[
                'image/jpeg',
                'image/jpg',
                'image/png',
                'application/pdf',
              ]}
              acceptedExtensions=".jpg,.jpeg,.png,.pdf"
              description="JPG, JPEG, PNG, PDF (ขนาดไม่เกิน 20 MB)"
              required
              draftOrganizeId={draftOrganizeId}
              cisFileType={
                DocumentType.COPY_OF_ID_OR_PASSPORT_AUTHORIZED_PERSON
              }
            />
          </Form.Item>
          <Form.Item
            name="COPY_OF_HOUSE_REGISTRATION_AUTHORIZED_PERSON"
            rules={[
              {
                required: true,
                message:
                  'กรุณาแนบไฟล์สำเนาทะเบียนบ้านของผู้ประกอบการ/ผู้มีอำนาจฯ พร้อมรับรองสำเนาถูกต้อง',
              },
            ]}
            className="!mb-0"
          >
            <UploadFileDragger
              label="2. สำเนาทะเบียนบ้านของผู้ประกอบการ/ผู้มีอำนาจฯ พร้อมรับรองสำเนาถูกต้อง"
              file={files.COPY_OF_HOUSE_REGISTRATION_AUTHORIZED_PERSON}
              setFile={(files) =>
                setFiles((prev) => ({
                  ...prev,
                  COPY_OF_HOUSE_REGISTRATION_AUTHORIZED_PERSON: files,
                }))
              }
              form={{
                key: 'COPY_OF_HOUSE_REGISTRATION_AUTHORIZED_PERSON',
                formInstance: form,
              }}
              acceptedTypes={[
                'image/jpeg',
                'image/jpg',
                'image/png',
                'application/pdf',
              ]}
              acceptedExtensions=".jpg,.jpeg,.png,.pdf"
              description="JPG, JPEG, PNG, PDF (ขนาดไม่เกิน 20 MB)"
              required
              draftOrganizeId={draftOrganizeId}
              cisFileType={
                DocumentType.COPY_OF_HOUSE_REGISTRATION_AUTHORIZED_PERSON
              }
            />
          </Form.Item>
          {(orgType === OrganizationTypes.PERSONAL ||
            orgType === OrganizationTypes.REGISTERED_INDIVIDUAL) && (
            <Form.Item
              name="ID_CARD_WITH_PERSON"
              rules={
                orgType === OrganizationTypes.PERSONAL
                  ? [
                      {
                        required: true,
                        message:
                          'กรุณาแนบไฟล์รูปถ่ายของผู้ประกอบการคู่กับบัตรประชาชน',
                      },
                    ]
                  : []
              }
              className="!mb-0"
            >
              <UploadFileDragger
                label="3. รูปถ่ายของผู้ประกอบการคู่กับบัตรประชาชน"
                file={files.ID_CARD_WITH_PERSON}
                setFile={(files) =>
                  setFiles((prev) => ({
                    ...prev,
                    ID_CARD_WITH_PERSON: files,
                  }))
                }
                form={{ key: 'ID_CARD_WITH_PERSON', formInstance: form }}
                maxCount={5}
                maxSize={20}
                acceptedTypes={[
                  'image/jpeg',
                  'image/jpg',
                  'image/png',
                  'application/pdf',
                ]}
                acceptedExtensions=".jpg,.jpeg,.png,.pdf"
                description="JPG, JPEG, PNG, PDF (ขนาดไม่เกิน 20 MB)"
                required={orgType === OrganizationTypes.PERSONAL}
                draftOrganizeId={draftOrganizeId}
                cisFileType={DocumentType.ID_CARD_WITH_PERSON}
              />
            </Form.Item>
          )}
          <Form.Item name="POWER_OF_ATTORNEY" className="!mb-0">
            <UploadFileDragger
              label={
                orgType === OrganizationTypes.JURISTIC
                  ? '3. หนังสือมอบอำนาจ'
                  : '4. หนังสือมอบอำนาจ'
              }
              file={files.POWER_OF_ATTORNEY}
              setFile={(files) =>
                setFiles((prev) => ({
                  ...prev,
                  POWER_OF_ATTORNEY: files,
                }))
              }
              form={{ key: 'POWER_OF_ATTORNEY', formInstance: form }}
              acceptedTypes={[
                'image/jpeg',
                'image/jpg',
                'image/png',
                'application/pdf',
              ]}
              acceptedExtensions=".jpg,.jpeg,.png,.pdf"
              description="JPG, JPEG, PNG, PDF (ขนาดไม่เกิน 20 MB)"
              draftOrganizeId={draftOrganizeId}
              cisFileType={DocumentType.POWER_OF_ATTORNEY}
            />
          </Form.Item>
          <Form.Item
            name="COPY_OF_ID_OR_PASSPORT_ATTORNEY_GIVER"
            className="!mb-0"
          >
            <UploadFileDragger
              label={
                orgType === OrganizationTypes.JURISTIC
                  ? '4. สำเนาบัตรประจำตัวประชาชน หรือสำเนาหนังสือเดินทางของผู้มอบอำนาจฯ /ผู้รับมอบอำนาจ'
                  : '5. สำเนาบัตรประจำตัวประชาชน หรือสำเนาหนังสือเดินทางของผู้มอบอำนาจฯ /ผู้รับมอบอำนาจ'
              }
              file={files.COPY_OF_ID_OR_PASSPORT_ATTORNEY_GIVER}
              setFile={(files) =>
                setFiles((prev) => ({
                  ...prev,
                  COPY_OF_ID_OR_PASSPORT_ATTORNEY_GIVER: files,
                }))
              }
              form={{
                key: 'COPY_OF_ID_OR_PASSPORT_ATTORNEY_GIVER',
                formInstance: form,
              }}
              acceptedTypes={[
                'image/jpeg',
                'image/jpg',
                'image/png',
                'application/pdf',
              ]}
              acceptedExtensions=".jpg,.jpeg,.png,.pdf"
              description="JPG, JPEG, PNG, PDF (ขนาดไม่เกิน 20 MB)"
              draftOrganizeId={draftOrganizeId}
              cisFileType={DocumentType.COPY_OF_ID_OR_PASSPORT_ATTORNEY_GIVER}
            />
          </Form.Item>
        </div>
        <div className="flex flex-col mt-4">
          <Typography
            variant="paragraph-big"
            className="!text-text-primary !font-medium"
          >
            เอกสารระบุกิจการ/บริษัท
          </Typography>
          <Typography
            variant="paragraph-medium"
            className="!text-text-quarternary"
          >
            ใช้เพื่อยืนยันข้อมูลการจดทะเบียนของกิจการ และสถานะทางกฎหมายของธุรกิจ
          </Typography>
        </div>
        <Divider className="!my-3" />
        <div className="p-6 border border-border-primary rounded-xl flex flex-col gap-6">
          <Form.Item
            name="COPY_OF_COMPANY_REGISTRATION"
            rules={
              orgType === OrganizationTypes.REGISTERED_INDIVIDUAL
                ? [
                    {
                      required: true,
                      message:
                        'กรุณาแนบไฟล์สำเนาใบทะเบียนพาณิชย์ ที่มีชื่อของนิติบุคคล พร้อมรับรองสำเนาถูกต้อง และประทับตราสำคัญของนิติบุคคล',
                    },
                  ]
                : []
            }
            className="!mb-0"
          >
            <UploadFileDragger
              label="1. สำเนาใบทะเบียนพาณิชย์ ที่มีชื่อของนิติบุคคล พร้อมรับรองสำเนาถูกต้อง และประทับตราสำคัญของนิติบุคคล"
              file={files.COPY_OF_COMPANY_REGISTRATION}
              setFile={(files) =>
                setFiles((prev) => ({
                  ...prev,
                  COPY_OF_COMPANY_REGISTRATION: files,
                }))
              }
              form={{ key: 'COPY_OF_COMPANY_REGISTRATION', formInstance: form }}
              acceptedTypes={[
                'image/jpeg',
                'image/jpg',
                'image/png',
                'application/pdf',
              ]}
              acceptedExtensions=".jpg,.jpeg,.png,.pdf"
              description="JPG, JPEG, PNG, PDF (ขนาดไม่เกิน 20 MB)"
              required={orgType === OrganizationTypes.REGISTERED_INDIVIDUAL}
              draftOrganizeId={draftOrganizeId}
              cisFileType={DocumentType.COPY_OF_COMPANY_REGISTRATION}
            />
          </Form.Item>
          <Form.Item name="COPY_OF_VAT_REGISTRATION" className="!mb-0">
            <UploadFileDragger
              label="2. สำเนาทะเบียนภาษีมูลค่าเพิ่ม (ภ.พ.20) พร้อมประทับตราสำคัญของบริษัทฯ"
              file={files.COPY_OF_VAT_REGISTRATION}
              setFile={(files) =>
                setFiles((prev) => ({
                  ...prev,
                  COPY_OF_VAT_REGISTRATION: files,
                }))
              }
              form={{ key: 'COPY_OF_VAT_REGISTRATION', formInstance: form }}
              acceptedTypes={[
                'image/jpeg',
                'image/jpg',
                'image/png',
                'application/pdf',
              ]}
              acceptedExtensions=".jpg,.jpeg,.png,.pdf"
              description="JPG, JPEG, PNG, PDF (ขนาดไม่เกิน 20 MB)"
              draftOrganizeId={draftOrganizeId}
              cisFileType={DocumentType.COPY_OF_VAT_REGISTRATION}
            />
          </Form.Item>
          <Form.Item name="TRADEMARK" className="!mb-0">
            <UploadFileDragger
              label="3. เครื่องหมายการค้า"
              file={files.TRADEMARK}
              setFile={(files) =>
                setFiles((prev) => ({
                  ...prev,
                  TRADEMARK: files,
                }))
              }
              form={{ key: 'TRADEMARK', formInstance: form }}
              acceptedTypes={[
                'image/jpeg',
                'image/jpg',
                'image/png',
                'application/pdf',
              ]}
              acceptedExtensions=".jpg,.jpeg,.png,.pdf"
              description="JPG, JPEG, PNG, PDF (ขนาดไม่เกิน 20 MB)"
              draftOrganizeId={draftOrganizeId}
              cisFileType={DocumentType.TRADEMARK}
            />
          </Form.Item>
          <Form.Item
            name="PHOTO_OF_COMPANY_OR_PROJECT"
            rules={[
              {
                required: true,
                message: 'กรุณาอัพโหลดรูปถ่ายสถานที่ประกอบกิจการ',
              },
            ]}
            className="!mb-0"
          >
            <UploadFileDragger
              label="4. รุปถ่ายสถานที่ประกอบกิจการ"
              file={files.PHOTO_OF_COMPANY_OR_PROJECT}
              setFile={(files) =>
                setFiles((prev) => ({
                  ...prev,
                  PHOTO_OF_COMPANY_OR_PROJECT: files,
                }))
              }
              form={{ key: 'PHOTO_OF_COMPANY_OR_PROJECT', formInstance: form }}
              acceptedTypes={[
                'image/jpeg',
                'image/jpg',
                'image/png',
                'application/pdf',
              ]}
              acceptedExtensions=".jpg,.jpeg,.png,.pdf"
              description="JPG, JPEG, PNG, PDF (ขนาดไม่เกิน 20 MB)"
              required
              draftOrganizeId={draftOrganizeId}
              cisFileType={DocumentType.PHOTO_OF_COMPANY_OR_PROJECT}
            />
          </Form.Item>
          {/* {orgType === OrganizationTypes.JURISTIC && (
            <Form.Item
              name="COPY_OF_CERTIFIED_COMMERCIAL_REGISTRATION_WITH_SEAL"
              rules={[
                {
                  required: true,
                  message: "กรุณาอัพโหลดสำเนาใบทะเบียนพาณิชย์",
                },
              ]}
              className="!mb-0"
            >
              <UploadFileDragger
                label="5. สำเนาใบทะเบียนพาณิชย์ ที่มีชื่อของนิติบุคคล พร้อมรับรองสำเนาถูกต้อง และประทับตราสำคัญของนิติบุคคล"
                file={files.COPY_OF_CERTIFIED_COMMERCIAL_REGISTRATION_WITH_SEAL}
                setFile={(files) =>
                  setFiles((prev) => ({
                    ...prev,
                    COPY_OF_CERTIFIED_COMMERCIAL_REGISTRATION_WITH_SEAL: files,
                  }))
                }
                form={{
                  key: "COPY_OF_CERTIFIED_COMMERCIAL_REGISTRATION_WITH_SEAL",
                  formInstance: form,
                }}
                maxCount={5}
                maxSize={20}
                acceptedTypes={[
                  "image/jpeg",
                  "image/jpg",
                  "image/png",
                  "application/pdf",
                ]}
                acceptedExtensions=".jpg,.jpeg,.png,.pdf"
                description="JPG, JPEG, PNG, PDF (ขนาดไม่เกิน 20 MB)"
                required
                draftOrganizeId={draftOrganizeId}
                cisFileType={
                  DocumentType.COPY_OF_CERTIFIED_COMMERCIAL_REGISTRATION_WITH_SEAL
                }
              />
            </Form.Item>
          )} */}
        </div>
        <div className="flex flex-col mt-4">
          <Typography
            variant="paragraph-big"
            className="!text-text-primary !font-medium"
          >
            เอกสารด้านการเงิน
          </Typography>
          <Typography
            variant="paragraph-medium"
            className="!text-text-quarternary"
          >
            ใช้ประกอบการตรวจสอบสถานะทางการเงิน
            หรือบัญชีที่ใช้รับเงินในการซื้อขาย
          </Typography>
        </div>
        <Divider className="!my-3" />
        <div className="p-6 border border-border-primary rounded-xl flex flex-col gap-6">
          <Form.Item
            name="COPY_OF_BANK_ACCOUNT_RECEIVING_PAYMENTS"
            className="!mb-0"
            rules={[
              {
                required: true,
                message:
                  'กรุณาแนบไฟล์สำเนาหน้าสมุดบัญชีธนาคารที่ใช้ในการรับเงิน',
              },
            ]}
          >
            <UploadFileDragger
              label="สำเนาหน้าสมุดบัญชีธนาคารที่ใช้ในการรับเงิน"
              file={files.COPY_OF_BANK_ACCOUNT_RECEIVING_PAYMENTS}
              setFile={(files) =>
                setFiles((prev) => ({
                  ...prev,
                  COPY_OF_BANK_ACCOUNT_RECEIVING_PAYMENTS: files,
                }))
              }
              form={{
                key: 'COPY_OF_BANK_ACCOUNT_RECEIVING_PAYMENTS',
                formInstance: form,
              }}
              acceptedTypes={[
                'image/jpeg',
                'image/jpg',
                'image/png',
                'application/pdf',
              ]}
              acceptedExtensions=".jpg,.jpeg,.png,.pdf"
              description="JPG, JPEG, PNG, PDF (ขนาดไม่เกิน 20 MB)"
              required
              draftOrganizeId={draftOrganizeId}
              cisFileType={DocumentType.COPY_OF_BANK_ACCOUNT_RECEIVING_PAYMENTS}
            />
          </Form.Item>
        </div>
        <div className="flex flex-col mt-4">
          <Typography
            variant="paragraph-big"
            className="!text-text-primary !font-medium"
          >
            เอกสารประกอบอื่น ๆ
          </Typography>
          <Typography
            variant="paragraph-medium"
            className="!text-text-quarternary"
          >
            เอกสารอื่น ๆ (เช่น เอกสารอ้างอิง )
          </Typography>
        </div>
        <Divider className="!my-3" />
        <div className="p-6 border border-border-primary rounded-xl flex flex-col gap-6">
          <Form.Item name="OTHERS" className="!mb-0">
            <UploadFileDragger
              label="เอกสารอื่น ๆ"
              file={files.OTHERS}
              setFile={(files) =>
                setFiles((prev) => ({
                  ...prev,
                  OTHERS: files,
                }))
              }
              form={{ key: 'OTHERS', formInstance: form }}
              acceptedTypes={[
                'image/jpeg',
                'image/jpg',
                'image/png',
                'application/pdf',
              ]}
              acceptedExtensions=".jpg,.jpeg,.png,.pdf"
              description="JPG, JPEG, PNG, PDF (ขนาดไม่เกิน 20 MB)"
              draftOrganizeId={draftOrganizeId}
              cisFileType={DocumentType.OTHERS}
            />
          </Form.Item>
        </div>
      </div>
      {isInPopup ? (
        <Form.Item noStyle>
          <div className="fixed md:absolute bottom-0 inset-x-0 md:bottom-[-16px] w-full flex justify-end bg-white py-4 pr-4 md:pr-0">
            <Button
              htmlType="submit"
              bold="600"
              loading={isUploadFileCis || isLoadingSaveDraft}
            >
              บันทึกข้อมูล
            </Button>
          </div>
        </Form.Item>
      ) : (
        <div className="fixed bottom-0 w-full inset-x-0 py-4 bg-white shadow-xl">
          <div className="w-full container mx-auto flex flex-col-reverse md:flex-row px-4 justify-end gap-2">
            <Button
              variant="outlined"
              bold="600"
              onClick={() => {
                if (onSaveDraft) {
                  onSaveDraft();
                }
              }}
              loading={isUploadFileCis || isLoadingSaveDraft}
            >
              บันทึกแบบร่าง
            </Button>
            <Form.Item shouldUpdate noStyle>
              <Button
                htmlType="submit"
                bold="600"
                loading={isUploadFileCis || isLoadingSaveDraft}
              >
                ส่งอนุมัติยืนยันตัวตน
              </Button>
            </Form.Item>
          </div>
        </div>
      )}
    </Form>
  );
};

export default FormDraftFileInfo;
