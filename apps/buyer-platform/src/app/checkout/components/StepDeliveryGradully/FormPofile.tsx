import TextField from '@/components/DataEntry/TextField';
import ToggleSwitch from '@/components/DataEntry/ToggleSwitch';
import UploadFileDragger from '@/components/DataEntry/Upload/FileDragger';
import DrawerSelectAddress, {
  IAddress,
} from '@/components/Drawer/SelectAddress';
import {
  modeSelectAddress,
  useSelectAddressStore,
} from '@/store/select-address.store';
import { Form, FormInstance, Input, UploadFile } from 'antd';
import { useEffect, useState } from 'react';

type FormPoFileProps = {
  form: FormInstance<any>;
};

const FormPoFile: React.FC<FormPoFileProps> = ({ form }) => {
  const [poFiles, setPoFiles] = useState<UploadFile[]>([]);
  const [isOpenAddressDrawer, setIsOpenAddressDrawer] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<IAddress | null>(null);
  const { setMode } = useSelectAddressStore();
  const isTaxInvoice = Form.useWatch('isTaxInvoice', form);

  useEffect(() => {
    const { poFiles } = form.getFieldsValue();
    setPoFiles(poFiles || []);
  }, [form]);
  return (
    <>
      <Form form={form} layout="vertical" className="flex flex-col gap-4">
        <TextField
          name="poNumber"
          label="เลขที่อ้างอิง PO ของผู้สั่งซื้อ"
          placeholder="กรุณากรอกเลขที่อ้างอิง PO ของผู้สั่งซื้อ"
          rules={[
            {
              max: 30,
              message: 'ข้อมูลที่กรอกมีความยาวเกินกว่ากำหนด (30 ตัวอักษร)',
            },
            {
              pattern: /^[a-zA-Zก-๙0-9\s]+$/,
              message: 'ไม่อนุญาตให้กรอกอักขระพิเศษ',
            },
          ]}
        />
        <UploadFileDragger
          file={poFiles}
          setFile={setPoFiles}
          form={{ key: 'poFiles', formInstance: form }}
          label="แนบเอกสาร PO"
          maxCount={5}
          maxSize={10}
          acceptedTypes={[
            'image/jpeg',
            'image/jpg',
            'image/png',
            'application/pdf',
          ]}
          acceptedExtensions=".jpg,.jpeg,.png,.pdf"
          description="JPG, JPEG, PNG, PDF (ขนาดไม่เกิน 10 MB)"
          required={false}
          customFileList={true}
        />

        <Form.Item
          name="remarkPo"
          label="หมายเหตุ"
          className="!mb-0"
          rules={[
            {
              max: 500,
              message: 'ข้อมูลที่กรอกมีความยาวเกินกว่ากำหนด (500 ตัวอักษร)',
            },
          ]}
        >
          <Input.TextArea
            className="!text-base"
            rows={4}
            placeholder="ระบุหมายเหตุการวางบิล"
          />
        </Form.Item>
        <Form.Item name="isTaxInvoice" className="!mb-0">
          <ToggleSwitch
            type="text"
            isChecked={isTaxInvoice}
            showLabel={false}
            title="ต้องการใบกำกับภาษี"
            onChange={(checked) => {
              form.setFieldValue('isTaxInvoice', checked);
            }}
          />
        </Form.Item>
        {/* <div onClick={() => setIsOpenAddressDrawer(true)}>test</div> */}
      </Form>
      <DrawerSelectAddress
        isOpen={isOpenAddressDrawer}
        onClose={() => {
          setIsOpenAddressDrawer(false);
          setMode(modeSelectAddress.SELECT_ADDRESS);
        }}
        selectedAddress={selectedAddress}
        setSelectedAddress={setSelectedAddress}
        onSelectAddress={(address) => {}}
      />
    </>
  );
};

export default FormPoFile;
