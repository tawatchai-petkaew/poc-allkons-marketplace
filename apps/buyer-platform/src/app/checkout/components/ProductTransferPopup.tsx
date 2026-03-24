'use client';
import ResponsivePopup from '@/components/Popup';
import Typography from '@/components/Typography';
import { Form, FormInstance, Grid } from 'antd';
import Image from 'next/image';
import { Label } from '@/components/Label';
import TextField from '@/components/DataEntry/TextField';
import Button from '@/components/Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  transferToIndex: number;
  form: FormInstance<any>;
  onFinish: (values: any) => void;
}

export default function ProductTransferPopup({
  isOpen,
  onClose,
  transferToIndex,
  form,
  onFinish,
}: Props) {
  const product = form.getFieldValue('product');
  const quantityValue = Form.useWatch(['product', 'quantity'], form);
  const countValue = form.getFieldValue(['product', 'count']) || 0;
  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;
  return (
    <ResponsivePopup
      visible={isOpen}
      onClose={onClose}
      modalProps={{ width: '60vw' }}
    >
      <Form
        form={form}
        onFinish={() => {
          onFinish(product);
        }}
      >
        <div className="flex flex-col justify-between relative">
          <div className="absolute top-0 right-0 z-10 block md:hidden">
            <Button
              onClick={onClose}
              variant="outlined"
              className="!px-0"
              color="neutral"
              bold="400"
              icon={<i className="ri-close-line text-xl text-neutral-40"></i>}
            />
          </div>
          <div className="pb-6 md:pb-[170px]">
            <div className="flex flex-col">
              <Typography variant="h4">ย้ายสินค้า</Typography>
              <Typography
                variant="paragraph-medium"
                className="!text-text-tertiary"
              >
                คุณกำลังย้ายสินค้าไปยัง “รอบจัดส่ง ครั้งที่
                {String(transferToIndex + 1)}
              </Typography>
            </div>
            <div className="border border-border-primary p-3 rounded-2xl mt-6">
              <div className="flex items-center gap-3">
                <Image
                  src={product?.imagePath}
                  alt="Product Image"
                  width={80}
                  height={80}
                  className="rounded-lg"
                  onError={(e) => {
                    const currentImg = e.currentTarget as HTMLImageElement;
                    currentImg.src = '/assets/default-image.png';
                    currentImg.className = `object-contain object-center w-[80px] h-[80px] h-auto`;
                  }}
                />
                <div className="flex items-center justify-between flex-1 min-h-[80px]">
                  <div className="flex flex-col h-[80px] flex-1 md:flex-[0.6] items-start">
                    <Typography
                      variant="paragraph-medium"
                      className="!text-text-secondary !min-h-[48px]"
                      ellipsis={true}
                      ellipsisOptions={{ rows: 2 }}
                    >
                      {product?.name}
                    </Typography>
                    <div className="flex gap-2 overflow-x-auto mt-1">
                      {product?.variants?.variant1 && (
                        <Label
                          text={product?.variants?.variant1}
                          rounding="pill"
                          variant="ghost"
                          size="small"
                        />
                      )}
                      {product?.variants?.variant2 && (
                        <Label
                          text={product?.variants?.variant2}
                          rounding="pill"
                          variant="ghost"
                          size="small"
                        />
                      )}
                      {product?.variants?.variant3 && (
                        <Label
                          text={product?.variants?.variant3}
                          rounding="pill"
                          variant="ghost"
                          size="small"
                        />
                      )}
                      {product?.variants?.variant4 && (
                        <Label
                          text={product?.variants?.variant4}
                          rounding="pill"
                          variant="ghost"
                          size="small"
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex-[0.4] h-[80px] hidden md:flex flex-col items-end justify-between">
                    <Typography
                      variant="paragraph-small"
                      className={`${
                        countValue === 0
                          ? '!text-text-placeholder'
                          : '!text-primary'
                      }`}
                    >
                      จำนวนในรอบ{' '}
                      <span className="font-semibold">{countValue} </span>
                    </Typography>
                    <div className="flex items-center gap-1">
                      <Button
                        icon={<i className="ri-subtract-fill"></i>}
                        variant="outlined"
                        color="neutral"
                        onClick={() => {
                          form.setFieldValue(
                            ['product', 'quantity'],
                            Math.max(0, Number(quantityValue) - 1)
                          );
                        }}
                        disabled={quantityValue <= 0}
                        size="small"
                      />

                      <TextField
                        name={['product', 'quantity']}
                        type="number"
                        inputMode="numeric"
                        size="small"
                        className="!w-[84px] !text-center"
                        onInput={(e) => {
                          let value = e.currentTarget.value;
                          if (value && !/^\d+$/.test(value)) {
                            value = value.replace(/[^0-9]/g, '');
                            e.currentTarget.value = value;
                          }
                          const numValue = Number(value);
                          if (numValue > countValue) {
                            form.setFieldValue(['product', 'quantity'], 0);
                            e.currentTarget.value = countValue.toString();
                          }
                        }}
                        onBlur={(e) => {
                          form.setFieldValue(
                            ['product', 'quantity'],
                            Number(e.target.value)
                          );
                        }}
                      />
                      <Button
                        icon={<i className="ri-add-fill"></i>}
                        variant="outlined"
                        color="neutral"
                        onClick={() => {
                          form.setFieldValue(
                            ['product', 'quantity'],
                            Number(quantityValue) + 1
                          );
                        }}
                        disabled={quantityValue >= countValue}
                        size="small"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex md:hidden mt-2 items-end justify-between">
                <Typography
                  variant="paragraph-small"
                  className={
                    countValue === quantityValue
                      ? '!text-text-placeholder'
                      : '!text-primary'
                  }
                >
                  คงเหลือ{' '}
                  <span className="font-semibold">
                    {countValue - quantityValue}{' '}
                  </span>
                </Typography>
                <div className="flex items-center gap-1">
                  <Button
                    icon={<i className="ri-subtract-fill"></i>}
                    variant="outlined"
                    color="neutral"
                    onClick={() => {
                      form.setFieldValue(
                        ['product', 'quantity'],
                        Math.max(0, Number(quantityValue) - 1)
                      );
                    }}
                    disabled={quantityValue <= 0}
                    size="small"
                  />

                  <TextField
                    name={['product', 'quantity']}
                    type="number"
                    inputMode="numeric"
                    size="small"
                    className="!w-[84px] !text-center"
                    onInput={(e) => {
                      let value = e.currentTarget.value;
                      if (value && !/^\d+$/.test(value)) {
                        value = value.replace(/[^0-9]/g, '');
                        e.currentTarget.value = value;
                      }
                      const numValue = Number(value);
                      if (numValue > countValue) {
                        form.setFieldValue(['product', 'quantity'], 0);
                        e.currentTarget.value = countValue.toString();
                      }
                    }}
                    onBlur={(e) => {
                      form.setFieldValue(
                        ['product', 'quantity'],
                        Number(e.target.value)
                      );
                    }}
                  />
                  <Button
                    icon={<i className="ri-add-fill"></i>}
                    variant="outlined"
                    color="neutral"
                    onClick={() => {
                      form.setFieldValue(
                        ['product', 'quantity'],
                        Number(quantityValue) + 1
                      );
                    }}
                    disabled={quantityValue >= countValue}
                    size="small"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center items-center gap-2">
            <Button
              variant="outlined"
              color="neutral"
              fullWidth={isMobile}
              onClick={onClose}
            >
              ยกเลิก
            </Button>
            <Button
              htmlType="submit"
              fullWidth={isMobile}
              disabled={quantityValue <= 0}
            >
              ย้ายสินค้า
            </Button>
          </div>
        </div>
      </Form>
    </ResponsivePopup>
  );
}
