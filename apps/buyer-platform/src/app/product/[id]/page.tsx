'use client';
import { createCartItem, getCount } from '@/common/api/order-service/cart.api';
import { getRelatedProducts } from '@/common/api/product-service/product.api';
import { getProductBySlug } from '@/common/api/product-service/product.api';
import {
  ImageUpload,
  IProduct,
  IProductItem,
} from '@/common/interfaces/product.interface';
import CustomButton from '@/components/Button';
import ProductVariantButton from '@/components/Button/ProductVariant';
import CardStore from '@/components/Card/Store';
import { NextArrow, PrevArrow } from '@/components/Carousel';
import CountdownTimer from '@/components/CountdownTimer';
import ProductVariantDrawer from '@/components/Drawer/ProductVariant';
import { EmptyStateComponent } from '@/components/EmptyState';
import { FloatButtons } from '@/components/FloatButtons';
import RelatedProductSection from '@/components/Sections/RelatedProducts';
import Typography from '@/components/Typography';
import { sanitizeHtml } from '@/lib/dom-purify';
import { useNotification } from '@/hooks/notification.hook';
import usePopup from '@/hooks/usePopup';
import { useScreenWidth } from '@/hooks/useScreenWidth';
import {
  calculateDiscountPercentage,
  elipsisText,
  formatThaiBaht,
  getDiscountPrice,
  getFinalPrice,
  getSoldDisplay,
} from '@/utils/format';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Breadcrumb, Image, Input, Tabs, TabsProps } from 'antd';
import Cookies from 'js-cookie';
import NextImage from 'next/image';
import { redirect, useParams } from 'next/navigation';
import { ReactNode, useEffect, useRef, useState } from 'react';
import Slider, { Settings } from 'react-slick';
import ChooseMerchantPopup from './components/ChooseMerchantPopup';
import ProductPageSkeletion from './components/skeletions';
import './custom.css';
import Button from '@/components/Button';
import PopupNewLogin from '@/components/Popup/NewLogin';

interface DrawerProps {
  productName: string;
  variantType: string;
  variantList: IProductItem[];
  activeVariant?: IProductItem | null;
}

const mockUpFlashSales = {
  specialPrice: 400,
  endDate: '2025-07-24T10:00:00+07:00',
};

const BadgePriceBase: React.FC<{
  children?: ReactNode;
  width?: number;
  height?: number;
}> = ({ children, width = 67, height = 32 }) => {
  return (
    <div className="relative inline-flex items-center">
      <svg
        width={width}
        height={height}
        viewBox="0 0 67 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1.99902 18.4988C0.830324 17.0379 0.830323 14.9621 1.99902 13.5012L11.599 1.50122C12.3581 0.552356 13.5074 -5.90425e-07 14.7225 -6.43541e-07L16 -6.99382e-07L16 32L14.7225 32C13.5074 32 12.3581 31.4476 11.599 30.4988L1.99902 18.4988Z"
          fill="#E44218"
        />
        <path
          d="M16 0H61C64.3137 0 67 2.68629 67 6V26C67 29.3137 64.3137 32 61 32H16V0Z"
          fill="#E44218"
        />
      </svg>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

const FlashSalesLogo: React.FC<{ width?: number; height?: number }> = ({
  width = 160,
  height = 32,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 160 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M27.9799 14.303H33.8132L26.3132 25.3333V17.697H20.4799L27.9799 6.66666V14.303Z"
        fill="#F7D2CF"
      />
      <path
        d="M5.33325 25.1733V8H17.8133V11.3067H9.62659V14.9067H16.8266V18.2667H9.62659V25.1733H5.33325Z"
        fill="white"
      />
      <path
        d="M67.0747 25.4403V8.26692H71.368V15.0669H78.088V8.26692H82.3814V25.4403H78.088V18.6403H71.368V25.4403H67.0747Z"
        fill="white"
      />
      <path
        d="M57.2164 25.7067C56.0786 25.7067 55.0119 25.6178 54.0164 25.44C53.0386 25.28 52.1942 25.04 51.4831 24.72V21.0667C52.2653 21.4044 53.1275 21.68 54.0697 21.8933C55.0297 22.1067 55.9364 22.2133 56.7897 22.2133C57.8564 22.2133 58.6475 22.1156 59.1631 21.92C59.6964 21.7244 59.9631 21.2978 59.9631 20.64C59.9631 20.1956 59.8297 19.84 59.5631 19.5733C59.3142 19.3067 58.8964 19.0756 58.3097 18.88C57.7408 18.6667 56.9586 18.4178 55.9631 18.1333C54.7897 17.7778 53.8564 17.3867 53.1631 16.96C52.4697 16.5156 51.9719 15.9822 51.6697 15.36C51.3675 14.7378 51.2164 13.9733 51.2164 13.0667C51.2164 11.4311 51.8031 10.1778 52.9764 9.30666C54.1497 8.43555 55.8831 8 58.1764 8C59.1719 8 60.1408 8.08 61.0831 8.24C62.0253 8.38222 62.7897 8.55111 63.3764 8.74666V12.4267C62.6119 12.1244 61.8386 11.9022 61.0564 11.76C60.292 11.6178 59.5453 11.5467 58.8164 11.5467C57.8564 11.5467 57.0742 11.6356 56.4697 11.8133C55.8831 11.9911 55.5897 12.4 55.5897 13.04C55.5897 13.4133 55.6964 13.7156 55.9097 13.9467C56.1231 14.16 56.4875 14.3556 57.0031 14.5333C57.5364 14.7111 58.2564 14.9244 59.1631 15.1733C60.5675 15.5467 61.6431 16 62.3897 16.5333C63.1364 17.0489 63.652 17.6533 63.9364 18.3467C64.2208 19.0222 64.3631 19.7867 64.3631 20.64C64.3631 22.1511 63.7764 23.3778 62.6031 24.32C61.4297 25.2444 59.6342 25.7067 57.2164 25.7067Z"
        fill="white"
      />
      <path
        d="M32.4799 25.4403L39.0399 8.26692H43.6799L50.2399 25.4403H45.7599L44.2132 21.5469H38.4799L36.9599 25.4403H32.4799ZM39.0666 18.3736H43.6266L41.3332 12.4003L39.0666 18.3736Z"
        fill="white"
      />
      <path
        d="M141.692 25.4403V8.26692H154.358V11.5736H145.985V15.1736H153.372V18.5336H145.985V22.1336H154.358V25.4403H141.692Z"
        fill="white"
      />
      <path
        d="M127.096 25.4403V8.26692H131.389V22.1336H139.496V25.4403H127.096Z"
        fill="white"
      />
      <path
        d="M106.628 25.4403L113.188 8.26692H117.828L124.388 25.4403H119.908L118.362 21.5469H112.628L111.108 25.4403H106.628ZM113.215 18.3736H117.775L115.482 12.4003L113.215 18.3736Z"
        fill="white"
      />
      <path
        d="M99.048 25.7067C97.9102 25.7067 96.8436 25.6178 95.848 25.44C94.8702 25.28 94.0258 25.04 93.3147 24.72V21.0667C94.0969 21.4044 94.9591 21.68 95.9014 21.8933C96.8614 22.1067 97.768 22.2133 98.6214 22.2133C99.688 22.2133 100.479 22.1156 100.995 21.92C101.528 21.7244 101.795 21.2978 101.795 20.64C101.795 20.1956 101.661 19.84 101.395 19.5733C101.146 19.3067 100.728 19.0756 100.141 18.88C99.5725 18.6667 98.7902 18.4178 97.7947 18.1333C96.6213 17.7778 95.688 17.3867 94.9947 16.96C94.3013 16.5156 93.8036 15.9822 93.5013 15.36C93.1991 14.7378 93.048 13.9733 93.048 13.0667C93.048 11.4311 93.6347 10.1778 94.808 9.30666C95.9813 8.43555 97.7147 8 100.008 8C101.004 8 101.972 8.08 102.915 8.24C103.857 8.38222 104.621 8.55111 105.208 8.74666V12.4267C104.444 12.1244 103.67 11.9022 102.888 11.76C102.124 11.6178 101.377 11.5467 100.648 11.5467C99.688 11.5467 98.9058 11.6356 98.3014 11.8133C97.7147 11.9911 97.4213 12.4 97.4213 13.04C97.4213 13.4133 97.528 13.7156 97.7414 13.9467C97.9547 14.16 98.3191 14.3556 98.8347 14.5333C99.368 14.7111 100.088 14.9244 100.995 15.1733C102.399 15.5467 103.475 16 104.221 16.5333C104.968 17.0489 105.484 17.6533 105.768 18.3467C106.052 19.0222 106.195 19.7867 106.195 20.64C106.195 22.1511 105.608 23.3778 104.435 24.32C103.261 25.2444 101.466 25.7067 99.048 25.7067Z"
        fill="white"
      />
    </svg>
  );
};

export default function ProductPage() {
  const { showPopup, PopupComponent } = usePopup();
  const { notification } = useNotification();

  const params = useParams();
  const productSlug = params?.id as string;

  const { data: productQuery, error: fetchProductError } = useQuery({
    queryKey: ['product', '', productSlug?.toString()],
    queryFn: () => getProductBySlug(productSlug?.toString() || ''),
    enabled: !!productSlug,
  });

  const { data: relatedProductsQuery } = useQuery({
    queryKey: ['relatedProducts', productSlug?.toString()],
    queryFn: () => getRelatedProducts(productSlug?.toString() || ''),
    enabled: !!productSlug,
  });

  const { refetch: refetchCount } = useQuery({
    queryKey: ['cart-count'],
    queryFn: () => {
      const auth = Cookies.get('auth');
      const authData = auth ? JSON.parse(auth) : null;
      return getCount(authData?.accessToken);
    },
  });

  const { mutate: createCartItemMutation, isPending: isPendingAddToCart } =
    useMutation({
      mutationFn: (args: {
        merchantSlug: string;
        quantity: number;
        productItemId: number;
        unit: string;
      }) => {
        const auth = Cookies.get('auth');
        const authData = auth ? JSON.parse(auth) : null;
        return createCartItem(args.merchantSlug, authData?.accessToken, {
          quantity: args.quantity,
          productItemId: args.productItemId,
          unit: args.unit,
        });
      },
      onSuccess: () => {
        notification.success({
          message: 'เพิ่มสินค้าลงรถเข็นสำเร็จ',
          duration: 3,
          icon: <i className="ri-information-line text-primary"></i>,
        });
        refetchCount();
      },
      onError: (e: any) => {
        if (e.response?.data.message === 'สินค้าหมดสต๊อก') {
          showPopup('error', {
            title: 'สินค้าหมดสต๊อก',
            description: 'กรุณาลองใหม่ภายหลัง',
          });
        } else {
          showPopup('error', {
            title: 'เกิดข้อผิดพลาด',
            description: 'เกิดข้อผิดพลาดในการเพิ่มสินค้าลงรถเข็น',
          });
        }
      },
    });

  const relatedProducts: IProduct[] = relatedProductsQuery?.data || [];

  const handleAddToCart = ({
    merchantSlug,
    quantity,
    productItemId,
    unit,
  }: {
    merchantSlug: string;
    quantity: number;
    productItemId: number;
    unit: string;
  }) => {
    const auth = Cookies.get('auth');
    if (!auth) {
      setIsLoginVisible(true);
      return;
    } else {
      createCartItemMutation({ merchantSlug, quantity, productItemId, unit });
    }
  };

  const isMobile = useScreenWidth() < 768;
  const isDesktop = useScreenWidth() >= 1024;

  const [activeImage, setActiveImage] = useState<ImageUpload | null>(null);
  const [productCount, setProductCount] = useState<number>(1);
  const [isVariantDrawerOpen, setIsVariantDrawerOpen] =
    useState<boolean>(false);
  const [drawerProps, setDrawerProps] = useState<DrawerProps>({
    productName: 'test',
    variantType: '',
    variantList: [],
    activeVariant: {} as IProductItem,
  });

  const [isLoginVisible, setIsLoginVisible] = useState<boolean>(false);
  const [isOpenMerchantPopup, setIsOpenMerchantPopup] =
    useState<boolean>(false);
  const [productMerchant, setProductMerchant] = useState<IProduct | null>(null);

  // Flashsales timer states
  const [days, setDays] = useState<number>(0);
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);

  // const variantRefs = useRef<(HTMLDivElement | null)[]>([]);

  // const productVariantNumbers: string[] = [];
  // const initVariant: { [key: string]: string } = {};
  // const extractedSubCategories: string[] = [];

  // extract product dimensions
  // let index = 0;
  // for (const key in mockUpProductVariant) {
  //   const regex = /dimension\d+/;
  //   if (regex.test(key)) {
  //     productVariantNumbers.push(key.replace("dimension", ""));
  //     initVariant[`activeVariant${key.replace("dimension", "")}`] =
  //       mockUpProduct.productVariantDetailDtoModel.productDimensionDtoModels[
  //         index
  //       ].value;
  //     index++;
  //   }
  // }

  // extract sub categories
  // for (const key in mockUpProduct.productVariantDetailDtoModel) {
  //   const regex = /^subCategory\d+Name$/;
  //   if (regex.test(key)) {
  //     extractedSubCategories.push(
  //       mockUpProduct.productVariantDetailDtoModel[
  //         key as keyof typeof mockUpProduct.productVariantDetailDtoModel
  //       ] as string
  //     );
  //   }
  // }

  // const [activeVariant, setActiveVariant] = useState<{ [key: string]: string }>(
  //   initVariant
  // );

  const product: IProduct | null = productMerchant
    ? productMerchant
    : productQuery?.data;

  const variantRef = useRef<HTMLDivElement>(null);

  const [activeVariant, setActiveVariant] = useState<IProductItem | null>(null);

  useEffect(() => {
    if (product && product?.productItems?.length > 1) {
      setActiveVariant(product?.productItems[0]);
    }
  }, [product]);

  // const allVariantsChecked = Object.values(activeVariant).every(
  //   (value) => value !== ""
  // );

  useEffect(() => {
    if (product && product?.productImages?.length > 0) {
      setActiveImage(product?.productImages[0]?.imageUpload);
    }
  }, [product]);

  useEffect(() => {
    const target = new Date(mockUpFlashSales?.endDate || '');

    const interval = setInterval(() => {
      const now = new Date();
      const timeDiff = target.getTime() - now.getTime();

      if (timeDiff <= 0) {
        clearInterval(interval);
        return;
      }

      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      setDays(days);
      setHours(hours);
      setMinutes(minutes);
      setSeconds(seconds);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const settings: Settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 5,
    swipeToSlide: false,
    slidesToScroll: 1,
    adaptiveHeight: true,
    arrows: true,
    prevArrow: (
      <PrevArrow
        customStyles="!w-[2rem] !h-[2rem] !absolute !left-0 !-translate-x-2"
        dynamicArrow={true}
      />
    ),
    nextArrow: (
      <NextArrow
        customStyles="!w-[2rem] !h-[2rem] !absolute !right-0 !translate-x-2"
        dynamicArrow={true}
      />
    ),
  };

  const productDetailTabProps: TabsProps['items'] = [
    {
      key: '1',
      label: 'รายละเอียด',
      children:
        product?.description && product?.description !== '' ? (
          <div
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(product?.description),
            }}
          />
        ) : (
          <EmptyStateComponent />
        ),
    },
    {
      key: '2',
      label: 'คุณสมบัติ',
      children: <EmptyStateComponent />,
    },
    {
      key: '3',
      label: 'วิธีใช้',
      children: <EmptyStateComponent />,
    },
  ];

  // const showSeeMoreButton = (index: number) =>
  //   isMobile
  //     ? (variantRefs.current[index]?.clientHeight || 0) > 140 + 16
  //     : (variantRefs.current[index]?.clientHeight || 0) > 156 + 16;

  const showSeeMoreButton = () => {
    if (isMobile) {
      return (variantRef.current?.clientHeight || 0) > 140 + 16;
    } else {
      return (variantRef.current?.clientHeight || 0) > 156 + 16;
    }
  };

  const isActiveFlashSales =
    Number(productSlug) === 3
      ? mockUpFlashSales.endDate > new Date().toISOString() ||
        (days === 0 && hours === 0 && minutes === 0 && seconds === 0)
      : false;

  useEffect(() => {
    if (fetchProductError) {
      redirect('/not-found');
    }
  }, [fetchProductError]);

  useEffect(() => {
    if (isVariantDrawerOpen && isMobile) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [isVariantDrawerOpen, isMobile]);

  const resolvedPrice = activeVariant
    ? activeVariant?.price
    : (product?.productItems?.length || 0) > 1
      ? 0
      : product?.productItems[0]?.price;

  const resolvedDiscount = activeVariant
    ? getDiscountPrice(
        activeVariant?.price,
        activeVariant?.productDiscount ?? undefined
      )
    : getDiscountPrice(
        (product?.productItems?.length || 0) > 1
          ? 0
          : product?.productItems[0]?.price || 0,
        (product?.productItems?.length || 0) > 1
          ? undefined
          : (product?.productItems[0]?.productDiscount ?? undefined)
      );

  const finalPrice = getFinalPrice(resolvedPrice || 0, resolvedDiscount);

  if (!product) return <ProductPageSkeletion />;

  return (
    <div className={`bg-background-secondary pb-[12rem] md:pb-[3.5rem]`}>
      {/* Error Popup */}
      <PopupComponent />
      {/* Login Popup */}
      <PopupNewLogin
        visible={isLoginVisible}
        onClose={() => setIsLoginVisible(false)}
      />
      {/* Popup */}
      <div className="container mx-auto">
        <div className="py-4 lg:py-[2rem] px-3 sm:px-0">
          <Breadcrumb
            separator=">"
            items={[
              {
                title: (
                  <div className="flex gap-1">
                    <i className="ri-home-6-line !text-text-breadcrumb"></i>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-breadcrumb"
                    >
                      หน้าแรก
                    </Typography>
                  </div>
                ),
                href: '/',
              },
              {
                title: (
                  <Typography
                    variant="paragraph-small"
                    className="!text-text-breadcrumb max-w-[180px] truncate"
                  >
                    {product?.productCategory.name}
                  </Typography>
                ),
                href: `/category/${product?.productCategory.name.replaceAll('/', ' ')}-cat.${product?.productCategory.id}`,
              },
              {
                title: (
                  <Typography
                    variant="paragraph-small"
                    className="!text-primary"
                    ellipsis={true}
                    ellipsisOptions={{ rows: 2 }}
                  >
                    {elipsisText(product?.name, 50)}
                  </Typography>
                ),
                href: `/product/${product?.slug}`,
              },
            ]}
          />
        </div>
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-[40%] w-full px-4 flex flex-col gap-3">
            <div className="relative !aspect-square !w-full !h-auto flex items-center justify-center rounded-lg custom">
              {activeImage && activeImage.url !== '' ? (
                <Image.PreviewGroup
                  items={product?.productImages.map(
                    (img) => img.imageUpload.url
                  )}
                >
                  <Image
                    alt={product?.name}
                    src={activeImage?.url || ''}
                    onError={(e) => {
                      const currentImg = e.currentTarget as HTMLImageElement;
                      currentImg.src = '/assets/default-image.png';
                      currentImg.className = `object-contain object-center w-[60%] h-auto`;
                    }}
                  />
                </Image.PreviewGroup>
              ) : (
                <NextImage
                  src={'/assets/default-image.png'}
                  alt={product?.name}
                  width={0}
                  height={0}
                  className="object-contain w-[60%] h-auto"
                />
              )}
              <div className="bg-background-primary absolute w-[80px] h-[80px] top-8 border-white border-[2px] right-6 flex items-center justify-center rounded-full z-10 shadow-md">
                <NextImage
                  src={
                    'https://stazseaprd.blob.core.windows.net/product-variant/3725/images/1663816003955-120560158.jpg'
                  }
                  alt={product?.productBrand?.name || product?.name}
                  width={0}
                  height={0}
                  className="object-cover w-full h-auto rounded-full"
                  onError={(e) => {
                    const currentImg = e.currentTarget as HTMLImageElement;
                    currentImg.src = '/assets/default-image.png';
                    currentImg.className = `object-contain object-center w-[60%] h-auto`;
                  }}
                />
              </div>
            </div>
            <div className="custom flex relative overflow-visible">
              <Slider {...settings} className="custom">
                {product?.productImages?.map((img) => (
                  <div
                    className={`!flex aspect-square items-center justify-center rounded-lg border border-transparent cursor-pointer outline-none ${
                      activeImage?.id === img.imageUpload.id
                        ? '!border-primary'
                        : ''
                    }`}
                    key={img.id}
                  >
                    {img.imageUpload.url && img.imageUpload.url !== '' ? (
                      <NextImage
                        src={img.imageUpload.url}
                        width={0}
                        height={0}
                        alt={product?.name}
                        className="object-cover aspect-square rounded-lg w-full h-full"
                        onClick={() => setActiveImage(img.imageUpload)}
                        onError={(e) => {
                          const currentImg =
                            e.currentTarget as HTMLImageElement;
                          currentImg.src = '/assets/default-image.png';
                          currentImg.className = `object-contain object-center w-[60%] h-auto`;
                        }}
                      />
                    ) : (
                      <NextImage
                        src={'/assets/default-image.png'}
                        width={0}
                        height={0}
                        alt={product?.name}
                        className="object-contain object-center w-[60%] h-auto mx-auto"
                      />
                    )}
                  </div>
                ))}
              </Slider>
            </div>
          </div>
          <div className="lg:w-[60%] w-full px-4 mt-4 md:mt-0">
            <div>
              <Typography
                variant="h2"
                className={`!text-text-secondary !line-clamp-2 ${
                  isMobile ? '!leading-[2rem]' : ''
                }`}
              >
                {product?.name}
              </Typography>
              <div className="flex items-center gap-[2rem]">
                <div className="flex items-center gap-2">
                  <i className="ri-barcode-fill text-xl"></i>
                  <Typography
                    variant={'paragraph-big-regular'}
                    className="!text-text-secondary"
                  >
                    {product?.barCode}
                  </Typography>
                </div>
                <div className="flex items-center gap-1">
                  <Typography
                    variant={'paragraph-middle-regular'}
                    className="!text-text-quarternary"
                  >
                    {`ขายแล้ว`}
                  </Typography>
                  <Typography
                    variant={'paragraph-middle-regular'}
                    className="!text-text-secondary"
                  >
                    {getSoldDisplay(activeVariant?.soldQuantity || 0)}
                  </Typography>
                  <Typography
                    variant={'paragraph-middle-regular'}
                    className="!text-text-quarternary"
                  >
                    {product?.unit}
                  </Typography>
                </div>
              </div>
              {product && productMerchant && (
                <div
                  className="flex items-center gap-2 mt-2 cursor-pointer w-fit"
                  onClick={() => {
                    setIsOpenMerchantPopup(true);
                  }}
                >
                  {product.merchant?.merchantIcon?.imageUpload?.url && (
                    <NextImage
                      src={product.merchant?.merchantIcon?.imageUpload?.url}
                      width={0}
                      height={0}
                      alt={
                        product?.merchant?.merchantTranslations[0]?.name || ''
                      }
                      className="object-contain object-center w-[28px] h-[28px]"
                      onError={(e) => {
                        const currentImg = e.currentTarget as HTMLImageElement;
                        currentImg.src = '/assets/default-image.png';
                        currentImg.className = `object-contain object-center w-[28px] h-[28px]`;
                      }}
                    />
                  )}
                  <Button
                    variant="outlined"
                    color="neutral"
                    icon={<i className="ri-refresh-line"></i>}
                    onClick={() => {
                      setIsOpenMerchantPopup(true);
                    }}
                  >
                    เปลี่ยนร้าน
                  </Button>
                </div>
              )}
              {/* Price */}
              <div
                className={`flex flex-col gap-4 mt-4 md:mt-[2rem] ${
                  isActiveFlashSales ? 'bg-darkOrange-p90 rounded-xl p-4' : ''
                }`}
              >
                <div className={`flex items-center gap-2`}>
                  <div
                    className={`flex flex-col md:flex-row items-start md:items-center md:gap-2`}
                  >
                    <Typography
                      variant="h1"
                      className={`${
                        isActiveFlashSales
                          ? '!text-darkOrange-00'
                          : '!text-primary'
                      }`}
                    >
                      {formatThaiBaht(
                        isActiveFlashSales
                          ? mockUpFlashSales.specialPrice
                          : finalPrice
                      )}
                    </Typography>
                    {resolvedDiscount > 0 && (
                      <Typography
                        variant="paragraph-big-strikethrough"
                        className="!text-text-disabled"
                      >
                        {formatThaiBaht(resolvedPrice)}
                      </Typography>
                    )}
                  </div>

                  {/* Flash Sales Discount Badge */}
                  {isActiveFlashSales && (
                    <div>
                      <BadgePriceBase
                        width={isMobile ? 43 : undefined}
                        height={isMobile ? 20 : undefined}
                      >
                        <Typography
                          variant={
                            isMobile ? 'paragraph-extra-small' : 'paragraph-big'
                          }
                          className="!text-white"
                        >
                          {`-${calculateDiscountPercentage(
                            product?.productItems[0]?.price ?? 0,
                            product?.productItems[0].productDiscount?.value ?? 0
                          )}%`}
                        </Typography>
                      </BadgePriceBase>
                    </div>
                  )}
                </div>
                {/* Flash Sales Countdown Timer */}
                {isActiveFlashSales && (
                  <div className="bg-gradient-to-r from-darkOrange-p20 to-darkOrange-00 rounded-xl">
                    <div
                      className={`flex items-center ${
                        isMobile ? 'justify-center' : 'justify-between'
                      } p-4`}
                    >
                      {!isMobile ? <FlashSalesLogo /> : null}
                      <CountdownTimer
                        prefixIcon={<i className="ri-timer-flash-line"></i>}
                        days={days}
                        hours={hours}
                        minutes={minutes}
                        seconds={seconds}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Variant Option Section */}
              <div className="mt-4 md:mt-[2rem]">
                {product?.slug && (
                  <Typography
                    variant={isMobile ? 'paragraph-medium' : 'paragraph-big'}
                    className="!text-text-quinary"
                  >
                    {`รหัสสินค้า ${product?.slug}`}
                  </Typography>
                )}
                <div className="flex flex-col gap-4">
                  {/* {productVariantNumbers.map((number) => (
                    <div className="flex flex-col gap-2" key={number}>
                      <Typography variant="paragraph-big">
                        {
                          mockUpProductVariant[
                            `dimension${number}` as keyof typeof mockUpProductVariant
                          ] as string
                        }
                      </Typography>
                      <div className="flex flex-col gap-1">
                        <div
                          className={`overflow-hidden ${
                            isMobile ? "max-h-[140px]" : "max-h-[156px]"
                          }`}
                        >
                          <div
                            className="flex flex-wrap gap-3"
                            ref={(el) => {
                              variantRefs.current[+number] = el;
                            }}
                          >
                            {(
                              mockUpProductVariant[
                                `dimensionValue${number}` as keyof typeof mockUpProductVariant
                              ] as IProductVariantDimensionValue[]
                            ).map((item) => (
                              <div key={item.productVaraintId}>
                                <ProductVariantButton
                                  isActive={
                                    activeVariant[`activeVariant${number}`] ===
                                    item?.value
                                  }
                                  onClick={() => {
                                    if (
                                      mockUpProductVariant[
                                        `dimension${number}` as keyof typeof mockUpProductVariant
                                      ] === "Model"
                                    ) {
                                      if (
                                        activeVariant[
                                          `activeVariant${number}`
                                        ] === item?.value
                                      ) {
                                        setActiveVariant({
                                          activeVariant1: "",
                                          activeVariant2: "",
                                          activeVariant3: "",
                                          [`activeVariant${number}`]: "",
                                        });
                                        return;
                                      }

                                      setActiveVariant({
                                        activeVariant1:
                                          mockUpProductVariant[
                                            "dimensionValue1"
                                          ][
                                            Math.floor(
                                              Math.random() *
                                                mockUpProductVariant[
                                                  "dimensionValue1"
                                                ].length
                                            )
                                          ].value,
                                        activeVariant2:
                                          mockUpProductVariant[
                                            "dimensionValue2"
                                          ][
                                            Math.floor(
                                              Math.random() *
                                                mockUpProductVariant[
                                                  "dimensionValue2"
                                                ].length
                                            )
                                          ].value,
                                        activeVariant3:
                                          mockUpProductVariant[
                                            "dimensionValue3"
                                          ][
                                            Math.floor(
                                              Math.random() *
                                                mockUpProductVariant[
                                                  "dimensionValue3"
                                                ].length
                                            )
                                          ].value,
                                        [`activeVariant${number}`]: item?.value,
                                      });
                                      return;
                                    }

                                    if (
                                      activeVariant[
                                        `activeVariant${number}`
                                      ] === item?.value
                                    ) {
                                      setActiveVariant({
                                        ...activeVariant,
                                        [`activeVariant${number}`]: "",
                                      });
                                    } else {
                                      setActiveVariant({
                                        ...activeVariant,
                                        [`activeVariant${number}`]: item?.value,
                                      });
                                    }
                                  }}
                                >
                                  {item?.value}
                                </ProductVariantButton>
                              </div>
                            ))}
                          </div>
                        </div>
                        {showSeeMoreButton(+number) && (
                          <div className="flex w-full justify-start">
                            <CustomButton
                              variant="link"
                              color="primary"
                              icon={<i className="ri-arrow-down-s-line"></i>}
                              onClick={() => {
                                setDrawerProps({
                                  ...drawerProps,
                                  variantType: mockUpProductVariant[
                                    `dimension${number}` as keyof typeof mockUpProductVariant
                                  ] as string,
                                  variantIndex: +number,
                                  variantList: (
                                    mockUpProductVariant[
                                      `dimensionValue${number}` as keyof typeof mockUpProductVariant
                                    ] as IProductVariantDimensionValue[]
                                  ).map((item) => item.value),
                                  activeVariant:
                                    activeVariant[`activeVariant${number}`],
                                });
                                setIsVariantDrawerOpen(true);
                              }}
                            >
                              ดูตัวเลือกทั้งหมด
                            </CustomButton>
                          </div>
                        )}
                      </div>
                    </div>
                  ))} */}
                  {product?.productItems?.length > 1 && (
                    <div className="flex flex-col gap-2">
                      <Typography variant="paragraph-big">ตัวเลือก</Typography>
                      <div className="flex flex-col gap-2">
                        <div
                          className={`flex flex-wrap gap-3 overflow-hidden ${
                            isMobile ? 'max-h-[140px]' : 'max-h-[156px]'
                          }`}
                          ref={variantRef}
                        >
                          {product?.productItems?.length > 1 &&
                            product?.productItems?.map((item) => {
                              return (
                                <ProductVariantButton
                                  key={item.id}
                                  isActive={item.id === activeVariant?.id}
                                  onClick={() => {
                                    if (item.id === activeVariant?.id) {
                                      setActiveVariant(null);
                                    } else {
                                      setActiveVariant(item);
                                    }
                                  }}
                                >
                                  {item?.primaryOptionsValue}
                                </ProductVariantButton>
                              );
                            })}
                        </div>
                        {showSeeMoreButton() && (
                          <div className="flex w-full justify-start">
                            <CustomButton
                              variant="link"
                              color="primary"
                              icon={<i className="ri-arrow-down-s-line"></i>}
                              onClick={() => {
                                setDrawerProps({
                                  ...drawerProps,
                                  productName: product?.name,
                                  variantType: 'ตัวเลือก',
                                  variantList: product?.productItems?.map(
                                    (item) => item
                                  ),
                                  activeVariant: activeVariant || null,
                                });
                                setIsVariantDrawerOpen(true);
                              }}
                            >
                              ดูตัวเลือกทั้งหมด
                            </CustomButton>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* Add to cart */}
              <div
                className={`rounded-lg bg-background-primary border border-border-primary pt-3 pb-2 px-3 md:p-6 ${
                  !isDesktop
                    ? 'fixed z-30 bottom-0 left-0 right-0 w-full items-center gap-2'
                    : 'mt-[2rem]'
                } flex flex-col items-center gap-6`}
              >
                {/* Product count */}
                <div className="flex w-full justify-between items-end gap-2">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                    <Typography
                      variant={'paragraph-big-regular'}
                      className="!text-text-quarternary !min-w-[3em]"
                    >
                      {!isDesktop ? 'จำนวน' : 'จำนวนสินค้า'}
                    </Typography>
                    <div className="flex items-center gap-2">
                      <CustomButton
                        icon={<i className="ri-subtract-fill"></i>}
                        variant="outlined"
                        color="neutral"
                        onClick={() => setProductCount(+productCount - 1)}
                        disabled={
                          +productCount <= 1 ||
                          (product?.productItems.length > 1 && !activeVariant)
                        }
                        size={isMobile ? 'small' : 'middle'}
                      />
                      <Input
                        value={productCount}
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        disabled={
                          product?.productItems.length > 1 && !activeVariant
                        }
                        onChange={(e) => {
                          if (+e.target.value > 999999) {
                            setProductCount(999999);
                          } else {
                            setProductCount(Number(e.target.value));
                          }
                        }}
                        onBlur={(e) => {
                          if (+e.target.value < 1) {
                            setProductCount(1);
                          }
                        }}
                        className={`${
                          isMobile
                            ? '!w-[64px] !h-[32px]'
                            : '!w-[84px] !h-[40px]'
                        } !rounded-lg !text-center`}
                      />
                      <CustomButton
                        icon={<i className="ri-add-fill"></i>}
                        variant="outlined"
                        color="neutral"
                        onClick={() => setProductCount(+productCount + 1)}
                        disabled={
                          +productCount >= 999999 ||
                          (product?.productItems.length > 1 && !activeVariant)
                        }
                        size={isMobile ? 'small' : 'middle'}
                      />
                    </div>
                  </div>
                  <div className="flex lg:flex-row flex-col items-center lg:gap-2 gap-0 relative">
                    <Typography
                      variant={'h2'}
                      className={`!text-primary  ${
                        !isDesktop
                          ? 'order-2 !text-[24px] !leading-[34px] !line-clamp-1'
                          : ''
                      }`}
                    >
                      {formatThaiBaht(
                        (isActiveFlashSales
                          ? mockUpFlashSales.specialPrice
                          : finalPrice) * +productCount
                      )}
                    </Typography>
                    {resolvedDiscount > 0 && (
                      <Typography
                        variant={'paragraph-big-strikethrough'}
                        className={`!text-text-disabled !line-clamp-1 absolute -top-4 right-0`}
                      >
                        {formatThaiBaht((resolvedPrice || 0) * +productCount)}
                      </Typography>
                    )}
                  </div>
                </div>
                <div className="flex w-full items-center gap-2">
                  <CustomButton
                    className="w-full"
                    variant="outlined"
                    color="neutral"
                    icon={<i className="ri-file-add-line"></i>}
                    iconPosition="start"
                    disabled={
                      product?.productItems.length > 1 && !activeVariant
                    }
                    loading={isPendingAddToCart}
                  >
                    เพิ่มในใบเสนอราคา
                  </CustomButton>
                  {productMerchant ? (
                    <CustomButton
                      className="w-full"
                      disabled={
                        product?.productItems.length > 1 && !activeVariant
                      }
                      onClick={() =>
                        handleAddToCart({
                          merchantSlug: product?.merchant?.slug || '',
                          quantity: productCount,
                          productItemId: activeVariant
                            ? activeVariant.id
                            : product?.productItems[0].id,
                          unit: product.unit,
                        })
                      }
                      loading={isPendingAddToCart}
                    >
                      เพิ่มในรถเข็น
                    </CustomButton>
                  ) : (
                    <CustomButton
                      className="w-full"
                      disabled={
                        product?.productItems.length > 1 && !activeVariant
                      }
                      onClick={() => setIsOpenMerchantPopup(true)}
                      icon={<i className="ri-store-2-line"></i>}
                    >
                      เลือกร้าน
                    </CustomButton>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Product Detail Tabs */}
        <Tabs
          defaultActiveKey="1"
          items={productDetailTabProps}
          className={`custom-tabs !my-6 md:!my-[3rem]`}
        />
        {/* Merchant Info */}
        {product && productMerchant && (
          <div className="mb-6 md:mb-[3rem] px-4 md:px-0 md:mt-[3rem]">
            <CardStore merchantDetails={product.merchant} />
          </div>
        )}
      </div>
      <div className="container mx-auto">
        <RelatedProductSection relatedProducts={relatedProducts} />
      </div>
      <ProductVariantDrawer
        open={isVariantDrawerOpen}
        onClose={() => {
          setIsVariantDrawerOpen(false);
        }}
        setActiveVariant={(variant: IProductItem | null) =>
          setActiveVariant(variant)
        }
        variantList={drawerProps.variantList}
        activeVariant={drawerProps.activeVariant}
        variantType={drawerProps.variantType}
        productName={drawerProps.productName}
      />
      <ChooseMerchantPopup
        productSlug={product.slug}
        quantity={productCount}
        isOpen={isOpenMerchantPopup}
        onClose={() => setIsOpenMerchantPopup(false)}
        setIsSelectedMerchant={(product: IProduct) => {
          setProductMerchant(product);
          setIsOpenMerchantPopup(false);
        }}
        showPopup={(type, params) => showPopup(type, params)}
        setIsOpenMerchantPopup={setIsOpenMerchantPopup}
      />
      <FloatButtons bottom={!isDesktop ? 186 : undefined} />
    </div>
  );
}
