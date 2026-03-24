import { Form, FormInstance } from 'antd';
import { FC } from 'react';
import Image from 'next/image';
import Typography from '@/components/Typography';
import { Label } from '@/components/Label';
import TextField from '@/components/DataEntry/TextField';
import Button from '@/components/Button';

type FormSelectProductsProps = {
  form: FormInstance<any>;
};

const FormSelectProducts: FC<FormSelectProductsProps> = ({ form }) => {
  const products = Form.useWatch('products', form);
  return (
    <Form form={form}>
      <Form.List name="products">
        {(fields) => (
          <div className="flex flex-col gap-4">
            {fields.map(({ key, name }) => {
              const {
                imagePath,
                name: productName,
                count,
                variants,
              } = form.getFieldValue(['products', name]);
              const quantityValue =
                Array.isArray(products) && products[name]?.quantity
                  ? products[name].quantity
                  : 0;

              return (
                <div
                  className="border border-border-primary p-3 rounded-2xl"
                  key={key}
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={imagePath}
                      alt="Product test"
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
                          {productName}
                        </Typography>
                        <div className="flex gap-2 overflow-x-auto mt-1">
                          {variants.variant1 && (
                            <Label
                              text={variants.variant1}
                              rounding="pill"
                              variant="ghost"
                              size="small"
                            />
                          )}
                          {variants.variant2 && (
                            <Label
                              text={variants.variant2}
                              rounding="pill"
                              variant="ghost"
                              size="small"
                            />
                          )}
                          {variants.variant3 && (
                            <Label
                              text={variants.variant3}
                              rounding="pill"
                              variant="ghost"
                              size="small"
                            />
                          )}
                          {variants.variant4 && (
                            <Label
                              text={variants.variant4}
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
                          className={
                            count === quantityValue
                              ? '!text-text-placeholder'
                              : '!text-primary'
                          }
                        >
                          คงเหลือ{' '}
                          <span className="font-semibold">
                            {count - quantityValue}{' '}
                          </span>
                        </Typography>
                        <div className="flex items-center gap-1">
                          <Button
                            icon={<i className="ri-subtract-fill"></i>}
                            variant="outlined"
                            color="neutral"
                            onClick={() => {
                              form.setFieldValue(
                                ['products', name, 'quantity'],
                                Math.max(0, Number(quantityValue) - 1)
                              );
                            }}
                            disabled={quantityValue <= 0}
                            size="small"
                          />

                          <TextField
                            name={[name, 'quantity']}
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
                              if (numValue > count) {
                                form.setFieldValue(
                                  ['products', name, 'quantity'],
                                  count
                                );
                                e.currentTarget.value = count.toString();
                              }
                            }}
                            onBlur={(e) => {
                              form.setFieldValue(
                                ['products', name, 'quantity'],
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
                                ['products', name, 'quantity'],
                                Number(quantityValue) + 1
                              );
                            }}
                            disabled={quantityValue >= count}
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
                        count === quantityValue
                          ? '!text-text-placeholder'
                          : '!text-primary'
                      }
                    >
                      คงเหลือ{' '}
                      <span className="font-semibold">
                        {count - quantityValue}{' '}
                      </span>
                    </Typography>
                    <div className="flex items-center gap-1">
                      <Button
                        icon={<i className="ri-subtract-fill"></i>}
                        variant="outlined"
                        color="neutral"
                        onClick={() => {
                          form.setFieldValue(
                            ['products', name, 'quantity'],
                            Math.max(0, Number(quantityValue) - 1)
                          );
                        }}
                        disabled={quantityValue <= 0}
                        size="small"
                      />

                      <TextField
                        name={[name, 'quantity']}
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
                          if (numValue > count) {
                            form.setFieldValue(
                              ['products', name, 'quantity'],
                              count
                            );
                            e.currentTarget.value = count.toString();
                          }
                        }}
                        onBlur={(e) => {
                          form.setFieldValue(
                            ['products', name, 'quantity'],
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
                            ['products', name, 'quantity'],
                            Number(quantityValue) + 1
                          );
                        }}
                        disabled={quantityValue >= count}
                        size="small"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Form.List>
    </Form>
  );
};
export default FormSelectProducts;
