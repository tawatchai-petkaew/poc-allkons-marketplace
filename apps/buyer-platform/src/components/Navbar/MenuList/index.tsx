import Typography from '@/components/Typography';
import { Avatar } from 'antd';
import { FC } from 'react';
import Image from 'next/image';

const menus = [
  {
    imgSrc: '/assets/icons/shopping-menu.svg',
    bgColor: '#ACC022',
    title: 'ซื้อของ',
    badgeTitle: '',
    description: '',
  },
  {
    imgSrc: '/assets/icons/cart-menu.svg',
    bgColor: '#9E0039',
    title: 'สินค้าในรถเข็น',
    badgeTitle: '4',
    description: '',
  },
  {
    imgSrc: '/assets/icons/boq-menu.svg',
    bgColor: '#0077C0',
    title: 'ใบเสนอราคา',
    badgeTitle: 'ใหม่',
    description: '4 รายการ',
  },
  {
    imgSrc: '/assets/icons/checkout-menu.svg',
    bgColor: '#FFAB08',
    title: 'ชำระเงิน/แนบสลิป',
    badgeTitle: '',
    description: 'ดำเนินการ 4 รายการ',
  },
  {
    imgSrc: '/assets/icons/shopping-menu.svg',
    bgColor: '#00AF43',
    title: 'ไซต์งาน จุดรับสินค้าของฉัน',
    badgeTitle: '',
    description: '',
  },
  {
    imgSrc: '/assets/icons/favorite-shop-menu.svg',
    bgColor: '#E44218',
    title: 'ร้านประจำ',
    badgeTitle: '',
    description: '12 ร้าน',
  },
  {
    imgSrc: '/assets/icons/delivery-menu.svg',
    bgColor: '#25287A',
    title: 'สถานะการส่งของ',
    badgeTitle: 'ใหม่',
    description: '8 รายการ',
  },
  {
    imgSrc: '/assets/icons/order-history-menu.svg',
    bgColor: '#5B6A83',
    title: 'ประวัติการซื้อ',
    badgeTitle: '',
    description: '',
  },
  {
    imgSrc: '/assets/icons/favorite-shop-menu.svg',
    bgColor: '#5B6A83',
    title: 'วงเงินเครดิต',
    badgeTitle: '',
    description: '',
  },
  {
    imgSrc: '/assets/icons/favorite-product-menu.svg',
    bgColor: '#5B6A83',
    title: 'สินค้าประจำ',
    badgeTitle: '',
    description: '',
  },
  {
    imgSrc: '/assets/icons/organization-menu.svg',
    bgColor: '#5B6A83',
    title: 'องค์กรและการจัดการ',
    badgeTitle: '',
    description: '',
  },
  {
    imgSrc: '/assets/icons/contact-menu.svg',
    bgColor: '#5B6A83',
    title: 'ติดต่อเรา',
    badgeTitle: '',
    description: '',
  },
];

type MenuListProps = {};

const MenuList: FC<MenuListProps> = () => {
  return (
    <div className="w-full grid grid-cols-3 gap-3">
      {menus.map((menu, index) => (
        <div
          key={index}
          className="relative flex flex-col gap-3 px-2 py-5 justify-strech items-center cursor-pointer hover:bg-neutral-bg rounded-lg"
        >
          {menu.badgeTitle && (
            <div className="absolute top-[6px] right-3">
              <div className="bg-error text-white text-xs px-2 py-1 rounded-full">
                {menu.badgeTitle}
              </div>
            </div>
          )}
          <Avatar
            size={52}
            className={`cursor-pointer`}
            style={{ backgroundColor: menu.bgColor }}
            icon={
              <Image
                src={menu.imgSrc}
                width={28}
                height={28}
                alt={`${menu.title}-icon`}
              />
            }
          />
          <div className="text-center">
            <Typography variant="paragraph-small" className="!text-secondary">
              {menu.title}
            </Typography>
            <Typography
              variant="paragraph-extra-small"
              className="!text-quinary"
            >
              {menu.description}
            </Typography>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MenuList;
