'use client';
import Typography from '@/components/Typography';
import { Divider, Table } from 'antd';
import { FC, useEffect, useState } from 'react';
import TextField from '@/components/DataEntry/TextField';
import OrderCard from './components/OrderCard';
import CustomButton from '@/components/Button';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getAllOrders, getOrderCounts } from '@/common/api/order-service/order.api';
import {
  IOrderCountResponse,
  IOrderItemResponse,
  IOrderResponse,
} from '@/common/interfaces/order.interface';
import { useInView } from 'react-intersection-observer';
import { SubOrderStatus } from '@/common/enum/suborder.enum';
import usePopup from '@/hooks/usePopup';
import { EmptyIllustration } from '@/components/Navbar';
import OrderTabBar from './components/OrderTabBar';
import ResponsivePopup from '@/components/Popup';
import {
  formatAddressDetail,
  formatThaiBaht,
  getDiscountPrice,
  getFinalPrice,
} from '@/utils/format';
import { ProductDiscount } from '@/common/interfaces/product.interface';
import dayjs from 'dayjs';
import { DeliveryTime } from '@/common/enum/payment.enum';
import Image from 'next/image';
import { Label } from '@/components/Label';
import { Grid } from 'antd';
import { TableProps } from 'antd/lib';

const MyOrderPage: FC = () => {
  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;

  const [activeTab, setActiveTab] = useState<string>('1');
  const [searchValue, setSearchValue] = useState<string>('');
  const [orders, setOrders] = useState<IOrderResponse[]>([]);
  const { ref, inView } = useInView();
  const [isOpenSubOrderProducts, setIsOpenSubOrderProducts] = useState(false);
  const [selectSubOrderIndex, setSelectSubOrderIndex] = useState<number | null>(
    null
  );
  const [selectedOrderData, setSelectedOrderData] =
    useState<IOrderResponse | null>(null);

  const resolvedSubOrderStatus = (key: string): SubOrderStatus | undefined => {
    switch (key) {
      case '2':
        return SubOrderStatus.NEW;
      case '4':
        return SubOrderStatus.PENDING_PAYMENT;
      case '5':
        return SubOrderStatus.PENDING_VERIFY;
      default:
        return undefined;
    }
  };

  const { data, hasNextPage, fetchNextPage, error, isLoading, refetch } =
    useInfiniteQuery({
      queryKey: ['orders', activeTab],
      queryFn: ({ pageParam }) => {
        if (activeTab !== '1' && activeTab !== '2' && activeTab !== '4') {
          return;
        }

        return getAllOrders({
          page: pageParam,
          pageLimit: 10,
          suborderStatus: resolvedSubOrderStatus(activeTab),
        });
      },
      initialPageParam: 1,
      getNextPageParam: (res) => {
        if (!res || !res.meta) return undefined;
        if (res.meta.currentPage < res.meta.totalPages) {
          return res.meta.currentPage + 1;
        }
        return undefined;
      },
      gcTime: 0,
    });

  const { data: orderCountsData, error: orderCountsError } = useQuery({
    queryKey: ['order-counts', activeTab],
    queryFn: () => getOrderCounts(),
    enabled: !!activeTab,
  });

  useEffect(() => {
    const ordersData: IOrderResponse[] =
      data?.pages?.map((page) => page?.data).flat() || [];

    if (activeTab !== '1' && activeTab !== '2' && activeTab !== '4') {
      setOrders([]);
    } else if (ordersData?.length > 0) {
      setOrders(ordersData);
    }
  }, [data]);

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView]);

  useEffect(() => {
    refetch();
  }, [activeTab]);

  useEffect(() => {
    if (error || orderCountsError) {
      showPopup('error', {
        title: 'เกิดข้อผิดพลาด',
        description: 'เกิดข้อผิดพลาดในการโหลดข้อมูล',
      });
    }
  }, [error, orderCountsError]);

  const orderCounts = orderCountsData as IOrderCountResponse[];

  const { showPopup, PopupComponent } = usePopup();

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

  return (
    <div className={`container mx-auto px-4 md:px0`}>
      <PopupComponent />
      <div className="flex flex-col gap-6 my-6">
        <Typography variant="page-title">การซื้อของฉัน</Typography>
        <OrderTabBar
          activeTab={activeTab}
          orderCounts={orderCounts}
          onTabChange={(key) => setActiveTab(key)}
        />
        <div className="flex items-center gap-2">
          <TextField
            placeholder="ค้นหาสินค้า รหัสสินค้า ชื่อร้าน แบรนด์"
            focusRing={true}
            prefix={
              <i
                className="ri-search-line cursor-pointer"
                onClick={() => {}}
              ></i>
            }
            value={searchValue}
            allowClear
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <CustomButton
            variant="outlined"
            color="neutral"
            icon={<i className="ri-arrow-up-down-line"></i>}
            className="!w-fit"
          ></CustomButton>
        </div>
      </div>
      {/* Empty State */}
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <EmptyIllustration />
          <Typography variant="paragraph-big" className="!text-text-secondary">
            ไม่พบคำสั่งซื้อ
          </Typography>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map((order, idx) => (
            <OrderCard
              key={idx}
              order={order}
              onSelectSubOrder={(index) => {
                setIsOpenSubOrderProducts(true);
                setSelectSubOrderIndex(index);
                setSelectedOrderData(order);
              }}
            />
          ))}
          <div ref={ref}></div>
        </div>
      )}
      <ResponsivePopup
        visible={isOpenSubOrderProducts}
        onClose={() => {
          setIsOpenSubOrderProducts(false);
          setSelectSubOrderIndex(null);
          setSelectedOrderData(null);
        }}
        modalProps={{
          width: '60vw',
        }}
      >
        {selectSubOrderIndex !== null &&
        selectedOrderData?.subOrders?.[selectSubOrderIndex] !== undefined
          ? (() => {
              const selectedSubOrder =
                selectedOrderData.subOrders![selectSubOrderIndex];
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
                    <CustomButton
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
                        {`${selectedOrderData?.number}-${
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

export default MyOrderPage;
