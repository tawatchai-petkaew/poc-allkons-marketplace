import {
  IOrderItemResponse,
  ISubOrderResponse,
} from '@/common/interfaces/order.interface';
import { ProductDiscount } from '@/common/interfaces/product.interface';
import {
  formatThaiBaht,
  getDiscountPrice,
  getFinalPrice,
} from '@/utils/format';
import Table, { ColumnsType } from 'antd/es/table';
import Image from 'next/image';
import Typography from '@/components/Typography';
import { Label } from '@/components/Label';
import { Grid } from 'antd';
import CustomButton from '@/components/Button';

interface Props {
  subOrder: ISubOrderResponse;
  onSelectSubOrder: (index: number) => void;
  index: number;
}

export default function OrderItemList({
  subOrder,
  onSelectSubOrder,
  index,
}: Props) {
  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;
  const showMoreButton = subOrder.orderItems.length > 3;

  const slicedItem = subOrder?.orderItems.slice(0, 3);
  const modalColumns: ColumnsType<IOrderItemResponse> = [
    {
      title: `รายการ (${subOrder?.orderItems.length} รายการ)`,
      dataIndex: 'name',
      key: 'name',
      width: '40%',
      render: (_, record) => {
        return (
          <div className="flex items-center gap-3">
            <div className="w-[72px] h-[72px] aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              <Image
                src={record.productItemImageUrl || '/assets/default-image.png'}
                width={72}
                height={72}
                alt={record.productItemName}
                className="object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = '/assets/default-image.png';
                  e.currentTarget.className = 'w-[60%] h-auto';
                }}
              />
            </div>
            <div>
              <Typography
                variant="paragraph-medium"
                className="!text-text-secondary"
              >
                {record.productItemName}
              </Typography>
              <div className="flex items-center gap-1">
                {record.productItem.primaryOptionsValue && (
                  <Label
                    text={record.productItem.primaryOptionsValue}
                    size="small"
                    variant="modern"
                    rounding="pill"
                    noBorder
                  />
                )}
                {record.productItem.secondaryOptionsValue && (
                  <Label
                    text={record.productItem.secondaryOptionsValue}
                    size="small"
                    variant="modern"
                    rounding="pill"
                    noBorder
                  />
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: 'ราคาต่อหน่วย',
      dataIndex: 'price',
      key: 'price',
      width: '20%',
      render: (_, record) => {
        const finalPrice = getFinalPrice(
          record.price,
          getDiscountPrice(
            record.price,
            record.productItem.productDiscount as ProductDiscount
          )
        );
        return (
          <div className="flex flex-col">
            <span>{formatThaiBaht(finalPrice)}</span>
          </div>
        );
      },
    },
    {
      title: 'จำนวน',
      dataIndex: 'count',
      key: 'count',
      width: '20%',
      render: (_, record) => `${record?.quantity}`,
    },
    {
      title: 'รวม',
      key: 'total',
      width: '20%',
      render: (_, record) => {
        const finalPrice = getFinalPrice(
          record.price,
          getDiscountPrice(
            record.price,
            record.productItem.productDiscount as ProductDiscount
          )
        );
        return (
          <div className="flex gap-2 items-center">
            <span className="text-text-primary font-medium">
              {formatThaiBaht(finalPrice * record.quantity)}
            </span>
            {record.productItem.productDiscount && (
              <span className="text-gray-400 line-through text-xs">
                {formatThaiBaht(record.price * record.quantity)}
              </span>
            )}
          </div>
        );
      },
    },
  ];

  const popupMapProducts = slicedItem;

  return (
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
            {slicedItem.map((product, idx: number) => (
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
                      {product.productItemImageUrl &&
                      product.productItemImageUrl !== '' ? (
                        <Image
                          src={product.productItemImageUrl}
                          width={40}
                          height={40}
                          alt={product.productItemName}
                          className="w-full h-auto object-center object-cover rounded-xl aspect-square"
                          onError={(e) => {
                            e.currentTarget.src = '/assets/default-image.png';
                            e.currentTarget.className = 'w-[60%] h-auto';
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
                        {product.productItemName}
                      </Typography>
                      <div className="flex items-center mt-1 gap-2 h-fit overflow-scroll max-w-[200px]">
                        {product.productItem.primaryOptionsValue && (
                          <Label
                            text={product.productItem.primaryOptionsValue}
                            rounding="pill"
                            variant="modern"
                            size="small"
                          />
                        )}
                        {product.productItem.secondaryOptionsValue && (
                          <Label
                            text={product.productItem.secondaryOptionsValue}
                            rounding="pill"
                            variant="modern"
                            size="small"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  <Typography
                    variant="paragraph-small"
                    className="!text-text-quinary"
                  >
                    x{product?.quantity}
                  </Typography>
                </div>
                <div className="flex justify-between items-center relative mt-2">
                  {product.productItem.productDiscount && (
                    <div className="absolute right-0 top-[-16px] flex items-center gap-1">
                      <Typography
                        variant="paragraph-small"
                        className="!text-text-disabled !line-through"
                      >
                        {formatThaiBaht(
                          getDiscountPrice(
                            product.price,
                            product.productItem
                              .productDiscount as ProductDiscount
                          ) * product.quantity
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
                      {formatThaiBaht(product.productItem.price)}
                    </Typography>
                  </div>
                  <Typography variant="h6" className="!text-primary">
                    {formatThaiBaht(
                      product.productItem.price * product.quantity
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
      {showMoreButton && (
        <div className="flex items-center justify-center w-full my-6">
          <CustomButton
            variant="outlined"
            color="primary"
            icon={<i className="ri-arrow-down-s-line"></i>}
            iconPosition="end"
            className="!w-fit"
            onClick={() => onSelectSubOrder(index)}
          >
            ดูสินค้าในรอบเพิ่มเติม
          </CustomButton>
        </div>
      )}
    </div>
  );
}
