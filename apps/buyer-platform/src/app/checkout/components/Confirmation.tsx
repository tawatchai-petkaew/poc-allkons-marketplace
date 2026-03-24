import { FC, useEffect, useState } from 'react';
import { Divider, Grid, Table, TableProps } from 'antd';
import Image from 'next/image';
import Typography from '@/components/Typography';
import { Label } from '@/components/Label';
import {
  DeliveryReceiveType,
  DeliveryTime,
  PaymentMethod,
} from '@/common/enum/payment.enum';
import dayjs from 'dayjs';
import {
  formatAddressDetail,
  formatThaiBaht,
  getDiscountPrice,
  getFinalPrice,
} from '@/utils/format';
import { ProductDiscount } from '@/common/interfaces/product.interface';
import Button from '@/components/Button';
import ResponsivePopup from '@/components/Popup';
import Checkbox from '@/components/DataEntry/Checkbox';
import {
  IOrderItemResponse,
  IOrderResponse,
  ISubOrderResponse,
} from '@/common/interfaces/order.interface';
import { SubOrderStatus } from '@/common/enum/suborder.enum';

const Confirmation: FC<{
  orderData: IOrderResponse;
  selectedSubOrderIndices: number[];
  onSubOrderSelect: (index: number, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  isAllSelected: boolean;
  isIndeterminate: boolean;
}> = ({
  orderData,
  selectedSubOrderIndices,
  onSubOrderSelect,
  onSelectAll,
  isAllSelected,
  isIndeterminate,
}) => {
  const [isOpenSubOrderProducts, setIsOpenSubOrderProducts] =
    useState<boolean>(false);
  const [selectSubOrderIndex, setSelectSubOrderIndex] = useState<number | null>(
    null
  );
  const [expandProducts, setExpandProducts] = useState<boolean[]>([]);

  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;

  // Check if we should show checkboxes based on delivery receive type
  const shouldShowCheckboxes =
    orderData?.deliveryReceiveType !== DeliveryReceiveType.SENDONCE;

  const columns: TableProps['columns'] = [
    {
      title: 'รายการ',
      dataIndex: 'productData',
      key: 'productData',
      width: 568,
      render: (_, record) => {
        return (
          <div className="!basis-6/12 flex items-center gap-3 h-full pr-3">
            <div className="flex justify-center items-center h-[72px] w-[72px] aspect-square bg-background-secondary/80 rounded-xl">
              {record.imagePath && record.imagePath !== '' ? (
                <Image
                  src={record.imagePath}
                  width={0}
                  height={0}
                  alt={record.name}
                  className="w-full h-auto object-center object-cover rounded-xl aspect-square"
                  onError={(e) => {
                    e.currentTarget.src = '/assets/default-image.png';
                    e.currentTarget.className = 'w-[60%] h-auto';
                  }}
                />
              ) : (
                <Image
                  src="/assets/default-image.png"
                  width={0}
                  height={0}
                  alt="Default product image"
                  className="w-[60%] h-auto"
                />
              )}
            </div>
            <div className="flex flex-col gap-1 h-auto justify-between">
              <Typography
                variant="paragraph-medium"
                className="!text-text-secondary !line-clamp-2"
              >
                {record.name}
              </Typography>
              {Object.entries(record.variants).length > 0 && (
                <div className="flex records-center gap-2 h-fit overflow-scroll max-w-[300px]">
                  {(Object.entries(record.variants) as [string, string][]).map(
                    ([key, value]) => (
                      <Label
                        key={key}
                        text={value}
                        rounding="pill"
                        variant="ghost"
                        size="small"
                      />
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: 'ราคาต่อหน่วย',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (_, record) => {
        return (
          <Typography
            variant="paragraph-small"
            className="!text-text-secondary"
          >
            {formatThaiBaht(record.specialPrice)}
          </Typography>
        );
      },
    },
    {
      title: 'จำนวน',
      dataIndex: 'count',
      width: 180,
      key: 'count',
    },
    {
      title: 'ราคารวม',
      dataIndex: 'priceTotal',
      key: 'priceTotal',
      width: 180,
      render: (_, record) => {
        return (
          <>
            {record.specialPrice !== record.price ? (
              <div className="flex gap-1 items-center">
                <Typography
                  variant="paragraph-medium"
                  className="!text-text-primary"
                >
                  {formatThaiBaht(record.specialPrice * record.count)}
                </Typography>
                <Typography
                  variant="paragraph-medium"
                  className="!text-text-disabled !line-through"
                >
                  {formatThaiBaht(record.price * record.count)}
                </Typography>
              </div>
            ) : (
              <Typography
                variant="paragraph-medium"
                className="!text-text-primary"
              >
                {formatThaiBaht(record.price * record.count)}
              </Typography>
            )}
          </>
        );
      },
    },
  ];

  const modalColumns: TableProps['columns'] = [
    {
      title: 'รายการ',
      dataIndex: 'productData',
      key: 'productData',
      width: 362,
      render: (_, record) => {
        return (
          <div className="!basis-6/12 flex items-center gap-3 h-full pr-3">
            <div className="flex justify-center items-center h-[72px] w-[72px] aspect-square bg-background-secondary/80 rounded-xl">
              {record.imagePath && record.imagePath !== '' ? (
                <Image
                  src={record.imagePath}
                  width={0}
                  height={0}
                  alt={record.name}
                  className="w-full h-auto object-center object-cover rounded-xl aspect-square"
                  onError={(e) => {
                    e.currentTarget.src = '/assets/default-image.png';
                    e.currentTarget.className = 'w-[60%] h-auto';
                  }}
                />
              ) : (
                <Image
                  src="/assets/default-image.png"
                  width={0}
                  height={0}
                  alt="Default product image"
                  className="w-[60%] h-auto"
                />
              )}
            </div>
            <div className="flex flex-col gap-1 h-auto justify-between">
              <Typography
                variant="paragraph-medium"
                className="!text-text-secondary !line-clamp-2"
              >
                {record.name}
              </Typography>
              {Object.entries(record.variants).length > 0 && (
                <div className="flex records-center gap-2 h-fit overflow-scroll max-w-[300px]">
                  {(Object.entries(record.variants) as [string, string][]).map(
                    ([key, value]) => (
                      <Label
                        key={key}
                        text={value}
                        rounding="pill"
                        variant="ghost"
                        size="small"
                      />
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: 'ราคาต่อหน่วย',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (_, record) => {
        return (
          <Typography
            variant="paragraph-small"
            className="!text-text-secondary"
          >
            {formatThaiBaht(record.specialPrice)}
          </Typography>
        );
      },
    },
    {
      title: 'จำนวน',
      dataIndex: 'count',
      width: 176,
      key: 'count',
    },
    {
      title: 'ราคารวม',
      dataIndex: 'priceTotal',
      key: 'priceTotal',
      width: 200,
      render: (_, record) => {
        return (
          <>
            {record.specialPrice !== record.price ? (
              <div className="flex gap-1 items-center">
                <Typography
                  variant="paragraph-medium"
                  className="!text-text-primary"
                >
                  {formatThaiBaht(record.specialPrice * record.count)}
                </Typography>
                <Typography
                  variant="paragraph-medium"
                  className="!text-text-disabled !line-through"
                >
                  {formatThaiBaht(record.price * record.count)}
                </Typography>
              </div>
            ) : (
              <Typography
                variant="paragraph-medium"
                className="!text-text-primary"
              >
                {formatThaiBaht(record.price * record.count)}
              </Typography>
            )}
          </>
        );
      },
    },
  ];

  useEffect(() => {
    if (shouldShowCheckboxes) {
      setExpandProducts(
        new Array(orderData?.subOrders?.length || 0).fill(false)
      );
    } else {
      setExpandProducts([true]);
    }
  }, [shouldShowCheckboxes, orderData]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <Typography variant="h5" className="!text-text-primary">
            การจัดส่งของคำสั่งซื้อ
          </Typography>
          <Typography
            variant="paragraph-medium"
            className="!text-text-quarternary !mt-1"
          >
            เลขที่คำสั่งซื้อ :{' '}
            <span className="!text-text-primary">
              {orderData?.number || '-'}
            </span>
          </Typography>
        </div>
      </div>
      {shouldShowCheckboxes && (
        <div className="flex flex-col gap-4">
          <Typography variant="paragraph-big" className="!text-text-secondary">
            รอบการจัดส่งทั้งหมด ({orderData?.subOrders?.length || 0})
          </Typography>
          <div className="flex items-center gap-2 mb-4">
            <Checkbox
              checked={isAllSelected}
              indeterminate={isIndeterminate}
              onChange={(e) => onSelectAll?.(e.target.checked)}
            />
            <Typography
              variant="paragraph-medium"
              className="!text-text-secondary"
            >
              เลือกทั้งหมด (ที่ชำระได้)
            </Typography>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-4">
        {orderData?.subOrders?.map(
          (subOrder: ISubOrderResponse, index: number) => {
            const address = formatAddressDetail({
              addressInfo: subOrder?.address || '',
              provinceId: Number(subOrder?.provinceId) || 0,
              provinceName: subOrder?.provinceName || '',
              districtId: Number(subOrder?.districtId) || 0,
              districtName: subOrder?.districtName || '',
              subDistrictId: Number(subOrder?.subDistrictId) || 0,
              subDistrictName: subOrder?.subDistrictName || '',
              zipCodeId: Number(subOrder?.zipcodeId) || 0,
              zipcodeName: subOrder?.zipCode || '',
            });
            const sumPriceProducts =
              subOrder?.orderItems?.reduce(
                (sum: number, product: IOrderItemResponse) =>
                  sum + product.price * product.quantity,
                0
              ) || 0;
            const mapProducts = subOrder?.orderItems?.map(
              (item: IOrderItemResponse) => ({
                key: item.id,
                name: item.productItemName || '-',
                imagePath: item.productItemImageUrl || '',
                price: item.productItem.price,
                count: item.quantity,
                variants: {},
                specialPrice: getFinalPrice(
                  item.productItem.price,
                  getDiscountPrice(
                    item.productItem.price,
                    item.productItem.productDiscount as ProductDiscount
                  )
                ),
              })
            );

            return (
              <div className="flex gap-3 w-full" key={subOrder.id}>
                {shouldShowCheckboxes && (
                  <div className="mt-6 md:mt-8">
                    <Checkbox
                      vertical
                      checked={selectedSubOrderIndices.includes(index)}
                      onChange={(e) => {
                        onSubOrderSelect(index, e.target.checked);
                      }}
                      disabled={subOrder.status !== SubOrderStatus.NEW}
                    />
                  </div>
                )}
                <div
                  className={`flex flex-col p-4 border rounded-xl transition-all duration-200 border-border-primary  ${
                    shouldShowCheckboxes ? 'w-[calc(100%_-_32px)]' : 'w-full'
                  } ${
                    subOrder.status !== SubOrderStatus.NEW
                      ? 'bg-background-secondary'
                      : 'bg-white'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    {shouldShowCheckboxes ? (
                      <div className="flex flex-col gap-2">
                        <Typography
                          variant="paragraph-big"
                          className="!text-text-primary"
                        >
                          รอบจัดส่ง{' '}
                          <span className="!font-semibold !text-icon-brand-dark">
                            ครั้งที่ {index + 1}
                          </span>
                        </Typography>
                        <div className="flex flex-col gap-1">
                          <div className="flex gap-2 items-end">
                            <i className="ri-file-list-3-line text-base text-text-tertiary" />
                            <Typography
                              variant="paragraph-small"
                              className="!text-text-tertiary"
                            >
                              หมายเลขบิล : {subOrder?.subOrderNumber || '-'}
                            </Typography>
                          </div>
                          <div className="flex gap-2 items-end">
                            <i className="ri-calendar-line text-base text-text-tertiary" />
                            <Typography
                              variant="paragraph-small"
                              className="!text-text-tertiary"
                            >
                              {dayjs(subOrder.deliveryDate)
                                .add(543, 'year')
                                .format('DD MMMM YYYY')}{' '}
                              (
                              {subOrder.deliveryTime === DeliveryTime.ANYTIME
                                ? 'ไม่ระบุช่วงเวลา'
                                : subOrder.deliveryTime === DeliveryTime.MORNING
                                  ? '08.00 - 12.00 น.'
                                  : subOrder.deliveryTime ===
                                      DeliveryTime.AFTERNOON
                                    ? '13.00 - 17.00 น.'
                                    : ''}
                              )
                            </Typography>
                          </div>
                          <div className="flex gap-2 items-start md:items-end">
                            <i className="ri-map-pin-line text-base text-text-tertiary" />
                            <Typography
                              variant="paragraph-small"
                              className="!text-text-tertiary"
                            >
                              {address || '-'}
                            </Typography>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <Typography
                          variant="paragraph-big"
                          className="!text-text-primary"
                        >
                          รอบจัดส่ง{' '}
                          <span className="!font-semibold !text-icon-brand-dark">
                            ครั้งที่ {index + 1}
                          </span>
                        </Typography>
                        <div className="flex gap-2 items-end">
                          <i className="ri-calendar-line text-base text-text-tertiary" />
                          <Typography
                            variant="paragraph-small"
                            className="!text-text-tertiary"
                          >
                            {dayjs(subOrder.deliveryDate)
                              .add(543, 'year')
                              .format('DD MMMM YYYY')}{' '}
                            (
                            {subOrder.deliveryTime === DeliveryTime.ANYTIME
                              ? 'ไม่ระบุช่วงเวลา'
                              : subOrder.deliveryTime === DeliveryTime.MORNING
                                ? '08.00 - 12.00 น.'
                                : subOrder.deliveryTime ===
                                    DeliveryTime.AFTERNOON
                                  ? '13.00 - 17.00 น.'
                                  : ''}
                            )
                          </Typography>
                        </div>
                        <div className="flex gap-2 items-start md:items-end">
                          <i className="ri-map-pin-line text-base text-text-tertiary" />
                          <Typography
                            variant="paragraph-small"
                            className="!text-text-tertiary"
                          >
                            {address || '-'}
                          </Typography>
                        </div>
                      </div>
                    )}
                    {shouldShowCheckboxes ? (
                      <div className="hidden md:flex items-center gap-2">
                        <Typography
                          variant="h4"
                          className="!text-icon-brand-dark !font-semibold"
                        >
                          {formatThaiBaht(sumPriceProducts, 2)}
                        </Typography>
                        {subOrder.status === SubOrderStatus.NEW ? (
                          <Label
                            text="ที่ต้องชำระ"
                            color="warning"
                            size="large"
                            variant="ghost"
                          />
                        ) : subOrder.status ===
                          SubOrderStatus.PENDING_PAYMENT ? (
                          <Label
                            text="กำลังรอชำระเงิน"
                            color="neutral"
                            variant="outlined"
                            size="large"
                          />
                        ) : subOrder.status ===
                          SubOrderStatus.PENDING_VERIFY ? (
                          <Label
                            text="อยู่ระหว่างตรวจสอบชำระเงิน"
                            color="neutral"
                            variant="outlined"
                            size="large"
                          />
                        ) : (
                          <></>
                        )}

                        <Button
                          variant="link"
                          color="neutral"
                          icon={
                            expandProducts[index] ? (
                              <i className="ri-arrow-up-s-line" />
                            ) : (
                              <i className="ri-arrow-down-s-line" />
                            )
                          }
                          onClick={() => {
                            const newExpandProducts = [...expandProducts];
                            newExpandProducts[index] =
                              !newExpandProducts[index];
                            setExpandProducts(newExpandProducts);
                          }}
                        />
                      </div>
                    ) : (
                      <div className="hidden md:flex">
                        <Typography
                          variant="h4"
                          className="!text-icon-brand-dark !font-semibold"
                        >
                          {formatThaiBaht(sumPriceProducts)}
                        </Typography>
                      </div>
                    )}
                  </div>
                  {isMobile && shouldShowCheckboxes && (
                    <div>
                      <Divider className="!my-2" />
                      <div className="flex justify-between items-center">
                        <div className="flex flex-wrap gap-2">
                          <Typography
                            variant="h4"
                            className="!text-icon-brand-dark !font-semibold"
                          >
                            {formatThaiBaht(sumPriceProducts, 2)}
                          </Typography>
                          {subOrder.status === SubOrderStatus.NEW ? (
                            <Label
                              text="ที่ต้องชำระ"
                              color="warning"
                              size="large"
                              variant="ghost"
                            />
                          ) : subOrder.status ===
                            SubOrderStatus.PENDING_PAYMENT ? (
                            <Label
                              text="กำลังรอชำระเงิน"
                              color="neutral"
                              variant="outlined"
                              size="large"
                            />
                          ) : subOrder.status ===
                            SubOrderStatus.PENDING_VERIFY ? (
                            <Label
                              text="อยู่ระหว่างตรวจสอบชำระเงิน"
                              color="neutral"
                              variant="outlined"
                              size="large"
                            />
                          ) : (
                            <></>
                          )}
                        </div>
                        <Button
                          variant="link"
                          color="neutral"
                          icon={
                            expandProducts[index] ? (
                              <i className="ri-arrow-up-s-line" />
                            ) : (
                              <i className="ri-arrow-down-s-line" />
                            )
                          }
                          onClick={() => {
                            const newExpandProducts = [...expandProducts];
                            newExpandProducts[index] =
                              !newExpandProducts[index];
                            setExpandProducts(newExpandProducts);
                          }}
                        />
                      </div>
                    </div>
                  )}
                  {expandProducts[index] && (
                    <>
                      <Divider className="!my-4" />
                      {isMobile ? (
                        <div className="p-2 rounded-lg bg-background-secondary">
                          <Typography
                            variant="paragraph-small"
                            className="!text-text-primary !mb-2"
                          >
                            รายการ (6 รายการ)
                          </Typography>
                          <div className="flex flex-col">
                            {mapProducts
                              .slice(0, 3)
                              .map((product, idx: number) => (
                                <div
                                  key={idx}
                                  className={`px-2 py-4 ${
                                    mapProducts.length !== idx + 1
                                      ? ' border-b border-border-primary'
                                      : ''
                                  }`}
                                >
                                  <div className="flex justify-between">
                                    <div className="flex gap-2 w-3/4">
                                      <Image
                                        src={product.imagePath}
                                        alt={product.name}
                                        width={40}
                                        height={40}
                                        className="object-cover"
                                        onError={(e) => {
                                          e.currentTarget.src =
                                            '/assets/default-image.png';
                                          e.currentTarget.className =
                                            'w-[40px] h-auto';
                                        }}
                                      />
                                      <div className="w-[calc(100%-40px)]">
                                        <Typography
                                          variant="paragraph-extra-small"
                                          className="!text-text-secondary"
                                          ellipsis={true}
                                          ellipsisOptions={{ rows: 1 }}
                                        >
                                          {product.name}
                                        </Typography>
                                        {Object.entries(product.variants)
                                          .length > 0 && (
                                          <div className="flex products-center mt-1 gap-2 h-fit overflow-scroll max-w-[300px]">
                                            {(
                                              Object.entries(
                                                product.variants
                                              ) as [string, string][]
                                            ).map(([key, value]) => (
                                              <Label
                                                key={key}
                                                text={value}
                                                rounding="pill"
                                                variant="outlined"
                                                size="small"
                                              />
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <Typography
                                      variant="paragraph-small"
                                      className="!text-text-quinary"
                                    >
                                      x1
                                    </Typography>
                                  </div>
                                  <div className="flex justify-between items-center relative mt-2">
                                    {product.specialPrice !== product.price && (
                                      <div className="absolute right-0 top-[-16px] flex items-center gap-1">
                                        <Typography
                                          variant="paragraph-small"
                                          className="!text-text-disabled !line-through"
                                        >
                                          {`฿${product.price.toLocaleString()}`}
                                        </Typography>
                                      </div>
                                    )}
                                    <div className="flex gap-2">
                                      <Typography
                                        variant="paragraph-extra-small"
                                        className="!text-text-quarternary"
                                      >
                                        ราคาต่อหน่วย
                                      </Typography>
                                      <Typography
                                        variant="paragraph-extra-small"
                                        className="!text-text-secondary"
                                      >
                                        ฿{product.price.toLocaleString()}
                                      </Typography>
                                    </div>
                                    <Typography
                                      variant="h6"
                                      className="!text-primary"
                                    >
                                      {product.specialPrice !== product.price
                                        ? formatThaiBaht(
                                            product.specialPrice * product.count
                                          )
                                        : formatThaiBaht(
                                            product.price * product.count
                                          )}
                                    </Typography>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4">
                          <Table
                            columns={columns}
                            dataSource={mapProducts.slice(0, 3)}
                            pagination={false}
                            scroll={{ x: 850 }} // Set minimum width for horizontal scroll
                            size="middle"
                            showHeader={true}
                            bordered={false}
                            className="[&_.ant-table]:!border-none 
                [&_.ant-table]:!bg-background-secondary 
                [&_.ant-table]:!rounded-2xl
                [&_.ant-table]:!p-3
                [&_.ant-table-tbody>tr>td]:!border-none 
                [&_.ant-table-tbody>tr>td]:!bg-transparent 
                [&_.ant-table-thead>tr>th]:!border-none 
                [&_.ant-table-thead>tr>th]:!bg-transparent 
                [&_.ant-table-thead>tr>th]:!font-normal 
                [&_.ant-table-thead>tr>th::before]:!hidden 
                [&_.ant-table-container]:!border-none 
                [&_.ant-table-content]:!border-none 
                [&_.ant-table-tbody>tr]:!border-none
                [&_td.ant-table-cell]:!py-0
                "
                          />
                        </div>
                      )}
                      {mapProducts.length > 3 && (
                        <div className="flex mt-3 justify-center">
                          <Button
                            variant="outlined"
                            icon={<i className="ri-arrow-down-s-line" />}
                            iconPosition="end"
                            bold="500"
                            onClick={() => {
                              setSelectSubOrderIndex(index);
                              setIsOpenSubOrderProducts(true);
                            }}
                          >
                            ดูสินค้าในรอบเพิ่มเติม
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          }
        )}
      </div>
      <ResponsivePopup
        visible={isOpenSubOrderProducts}
        onClose={() => {
          setIsOpenSubOrderProducts(false);
          setSelectSubOrderIndex(null);
        }}
        modalProps={{
          width: '60vw',
        }}
      >
        {selectSubOrderIndex !== null &&
        orderData?.subOrders?.[selectSubOrderIndex] !== undefined
          ? (() => {
              const selectedSubOrder =
                orderData.subOrders![selectSubOrderIndex];
              const popupAddress = formatAddressDetail({
                addressInfo: selectedSubOrder?.address || '',
                provinceId: Number(selectedSubOrder?.provinceId) || 0,
                provinceName: selectedSubOrder?.provinceName || '',
                districtId: Number(selectedSubOrder?.districtId) || 0,
                districtName: selectedSubOrder?.districtName || '',
                subDistrictId: Number(selectedSubOrder?.subDistrictId) || 0,
                subDistrictName: selectedSubOrder?.subDistrictName || '',
                zipCodeId: Number(selectedSubOrder?.zipcodeId) || 0,
                zipcodeName: selectedSubOrder?.zipCode || '',
              });
              const popupMapProducts = selectedSubOrder?.orderItems?.map(
                (item: IOrderItemResponse) => ({
                  key: item.id,
                  name: item.productItemName || '-',
                  imagePath: item.productItemImageUrl || '',
                  price: item.productItem.price,
                  count: item.quantity,
                  variants: {},
                  specialPrice: getFinalPrice(
                    item.productItem.price,
                    getDiscountPrice(
                      item.productItem.price,
                      item.productItem.productDiscount as ProductDiscount
                    )
                  ),
                })
              );

              return (
                <div className="flex flex-col relative">
                  <div className="absolute top-0 right-0 z-10 block md:hidden">
                    <Button
                      onClick={() => {
                        setIsOpenSubOrderProducts(false);
                        setSelectSubOrderIndex(null);
                      }}
                      variant="outlined"
                      className="!px-0"
                      color="neutral"
                      bold="400"
                      icon={
                        <i className="ri-close-line text-xl text-neutral-40"></i>
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col md:flex-row gap-1 md:gap-2">
                      <Typography
                        variant="paragraph-big"
                        className="!text-icon-brand-dark !font-semibold"
                      >
                        รอบจัดส่ง ครั้งที่ {(selectSubOrderIndex || 0) + 1}
                      </Typography>
                      <Typography
                        variant="paragraph-medium"
                        className="!text-text-primary"
                      >
                        {`${orderData?.number}-${
                          (selectSubOrderIndex || 0) + 1
                        }`}
                      </Typography>
                    </div>
                    <div className="flex gap-2 items-end">
                      <i className="ri-calendar-line text-base text-text-tertiary" />
                      <Typography
                        variant="paragraph-small"
                        className="!text-text-tertiary"
                      >
                        {dayjs(selectedSubOrder.deliveryDate)
                          .add(543, 'year')
                          .format('DD MMMM YYYY')}{' '}
                        (
                        {selectedSubOrder.deliveryTime === DeliveryTime.ANYTIME
                          ? 'ไม่ระบุช่วงเวลา'
                          : selectedSubOrder.deliveryTime ===
                              DeliveryTime.MORNING
                            ? '08.00 - 12.00 น.'
                            : selectedSubOrder.deliveryTime ===
                                DeliveryTime.AFTERNOON
                              ? '13.00 - 17.00 น.'
                              : ''}
                        )
                      </Typography>
                    </div>
                    <div className="flex gap-2 items-start md:items-end">
                      <i className="ri-map-pin-line text-base text-text-tertiary" />
                      <Typography
                        variant="paragraph-small"
                        className="!text-text-tertiary"
                      >
                        {popupAddress || '-'}
                      </Typography>
                    </div>
                  </div>
                  {!isMobile && <Divider />}
                  <div>
                    {isMobile ? (
                      <div className="p-2 mt-4 rounded-lg bg-background-secondary">
                        <Typography
                          variant="paragraph-small"
                          className="!text-text-primary !mb-2"
                        >
                          รายการ ({popupMapProducts.length} รายการ)
                        </Typography>
                        <div className="flex flex-col">
                          {popupMapProducts.map((product, idx: number) => (
                            <div
                              key={idx}
                              className={`px-2 py-4 ${
                                popupMapProducts.length !== idx + 1
                                  ? ' border-b border-border-primary'
                                  : ''
                              }`}
                            >
                              <div className="flex justify-between">
                                <div className="flex gap-2 w-3/4">
                                  <div className="flex justify-center items-center h-[40px] w-[40px] aspect-square bg-background-secondary/80 rounded-xl">
                                    {product.imagePath &&
                                    product.imagePath !== '' ? (
                                      <Image
                                        src={product.imagePath}
                                        width={40}
                                        height={40}
                                        alt={product.name}
                                        className="w-full h-auto object-center object-cover rounded-xl aspect-square"
                                        onError={(e) => {
                                          e.currentTarget.src =
                                            '/assets/default-image.png';
                                          e.currentTarget.className =
                                            'w-[60%] h-auto';
                                        }}
                                      />
                                    ) : (
                                      <Image
                                        src="/assets/default-image.png"
                                        width={24}
                                        height={24}
                                        alt="Default product image"
                                        className="w-[60%] h-auto"
                                      />
                                    )}
                                  </div>
                                  <div className="w-[calc(100%-40px)]">
                                    <Typography
                                      variant="paragraph-extra-small"
                                      className="!text-text-secondary"
                                      ellipsis={true}
                                      ellipsisOptions={{ rows: 1 }}
                                    >
                                      {product.name}
                                    </Typography>
                                    {Object.entries(product.variants).length >
                                      0 && (
                                      <div className="flex items-center mt-1 gap-2 h-fit overflow-scroll max-w-[200px]">
                                        {(
                                          Object.entries(product.variants) as [
                                            string,
                                            string,
                                          ][]
                                        ).map(([key, value]) => (
                                          <Label
                                            key={key}
                                            text={value}
                                            rounding="pill"
                                            variant="outlined"
                                            size="small"
                                          />
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <Typography
                                  variant="paragraph-small"
                                  className="!text-text-quinary"
                                >
                                  x{product.count}
                                </Typography>
                              </div>
                              <div className="flex justify-between items-center relative mt-2">
                                {product.specialPrice !== product.price && (
                                  <div className="absolute right-0 top-[-16px] flex items-center gap-1">
                                    <Typography
                                      variant="paragraph-small"
                                      className="!text-text-disabled !line-through"
                                    >
                                      {formatThaiBaht(
                                        product.price * product.count
                                      )}
                                    </Typography>
                                  </div>
                                )}
                                <div className="flex gap-2">
                                  <Typography
                                    variant="paragraph-extra-small"
                                    className="!text-text-quarternary"
                                  >
                                    ราคาต่อหน่วย
                                  </Typography>
                                  <Typography
                                    variant="paragraph-extra-small"
                                    className="!text-text-secondary"
                                  >
                                    {formatThaiBaht(product.specialPrice)}
                                  </Typography>
                                </div>
                                <Typography
                                  variant="h6"
                                  className="!text-primary"
                                >
                                  {formatThaiBaht(
                                    product.specialPrice * product.count
                                  )}
                                </Typography>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Table
                        columns={modalColumns}
                        dataSource={popupMapProducts}
                        pagination={false}
                        scroll={{ x: 850, y: 568 }}
                        size="middle"
                        showHeader={true}
                        bordered={false}
                        className="[&_.ant-table]:!border-none 
                      [&_.ant-table]:!bg-background-secondary 
                      [&_.ant-table]:!rounded-2xl
                      [&_.ant-table]:!p-3
                      [&_.ant-table-tbody>tr>td]:!border-none 
                      [&_.ant-table-tbody>tr>td]:!bg-transparent 
                      [&_.ant-table-thead>tr>th]:!border-none 
                      [&_.ant-table-thead>tr>th]:!bg-transparent 
                      [&_.ant-table-thead>tr>th]:!font-normal 
                      [&_.ant-table-thead>tr>th::before]:!hidden 
                      [&_.ant-table-container]:!border-none 
                      [&_.ant-table-content]:!border-none 
                      [&_.ant-table-tbody>tr]:!border-none
                      [&_td.ant-table-cell]:!py-0
                      "
                      />
                    )}
                  </div>
                </div>
              );
            })()
          : null}
      </ResponsivePopup>
    </div>
  );
};

export default Confirmation;
