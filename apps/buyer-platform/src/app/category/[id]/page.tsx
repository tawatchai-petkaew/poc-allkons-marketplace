'use client';
import { IProductCategory } from '@/common/interfaces/ProductCatagory.interface';
import CategoryCard from '@/components/Card/Category';
import CardProduct from '@/components/Card/Product';
import {
  BorderedNextArrow,
  BorderedPrevArrow,
  NextArrow,
  PrevArrow,
} from '@/components/Carousel';
import { FloatButtons } from '@/components/FloatButtons';
import CategoryPageSkeleton from '@/components/Skeletions/CategoryPage';
import Typography from '@/components/Typography';
import { useCategoryData } from '@/hooks/useCategoryData';
import { Breadcrumb, Grid, Pagination } from 'antd';
import {
  redirect,
  useParams,
  useRouter,
  useSearchParams,
} from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import Slider, { Settings } from 'react-slick';
import CustomButton from '@/components/Button';
import { useScreenWidth } from '@/hooks/useScreenWidth';
import { useQuery } from '@tanstack/react-query';
import { IProduct } from '@/common/interfaces/product.interface';
import {
  getProductsByCategoryId,
  ProductOrderBy,
} from '@/common/api/product-service/category.api';
import { EmptyStateComponent } from '@/components/EmptyState';
import usePopup from '@/hooks/usePopup';
import { getProductCategoryByIds } from '@/common/api/product-service/category.api';
import { getCurrentCategoryTree } from '@/common/api/product-service/category.api';

export default function CategoryPage() {
  const router = useRouter();
  const params = useParams();
  const { PopupComponent } = usePopup();

  const decodedId = decodeURIComponent(params?.id as string);
  const { categoryIdList } = useMemo(() => {
    const path = decodedId.split('-cat.');
    const ids = path[1] ? path[1].split('.') : [];
    return { categoryPath: path, categoryIdList: ids };
  }, [decodedId]);
  const searchParams = useSearchParams();

  // // Initialize Search Params
  // if (searchParams?.size === 0) {
  //   const searchParamsUrl = new URLSearchParams(searchParams);
  //   searchParamsUrl.set('page', '1');
  //   searchParamsUrl.set('limit', '30');
  //   searchParamsUrl.set('orderBy', ProductOrderBy.BEST_SELLER);
  //   redirect(`?${searchParamsUrl.toString()}`);
  // }

  // // Search Params
  // const page = Number(searchParams?.get('page')) || 1;
  // const limit = Number(searchParams?.get('limit')) || 30;
  const orderBy = searchParams?.get('orderBy') as ProductOrderBy;

  // const {
  //   data: allCategoryData,
  //   isLoading: allCategoryLoading,
  //   error: errorCategory,
  // } = useCategoryData();

  // const categories: IProductCategory[] = allCategoryData?.data || [];

  // const {
  //   data: productData,
  //   error: errorProducts,
  //   isLoading: productsLoading,
  // } = useQuery({
  //   queryKey: [
  //     'Category',
  //     categoryIdList[categoryIdList.length - 1],
  //     page,
  //     limit,
  //     orderBy,
  //   ],
  //   queryFn: () =>
  //     getProductsByCategoryId(
  //       categoryIdList[categoryIdList.length - 1],
  //       page,
  //       limit,
  //       orderBy
  //     ),
  //   enabled: !!categoryIdList[categoryIdList.length - 1],
  // });

  //const products: IProduct[] = productData?.data || [];

  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;
  const isDesktop = useScreenWidth() >= 768;

  // const { showPopup, PopupComponent } = usePopup();

  const [isSortingDropdownOpen, setIsSortingDropdownOpen] =
    useState<boolean>(false);

  const sortingOptions: {
    value: ProductOrderBy;
    label: string;
  }[] = [
    { value: ProductOrderBy.BEST_SELLER, label: 'สินค้าขายดี' },
    {
      value: ProductOrderBy.HIGH_PRICE_TO_LOW_PRICE,
      label: 'ราคา สูงสุด - ต่ำสุด',
    },
    {
      value: ProductOrderBy.LOW_PRICE_TO_HIGH_PRICE,
      label: 'ราคา ต่ำสุด - สูงสุด',
    },
  ];

  // Refs
  const dropdownMenuMobileRef = useRef<HTMLDivElement>(null);
  const dropdownMenuDesktopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ref = isDesktop ? dropdownMenuDesktopRef : dropdownMenuMobileRef;
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsSortingDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownMenuMobileRef, dropdownMenuDesktopRef, isDesktop]);

  // const totalPages =
  //   Math.ceil(productData?.meta?.totalItems / limit) > 0
  //     ? Math.ceil(productData?.meta?.totalItems / limit)
  //     : 1;

  // const handlePageSwitch = (
  //   action: 'next' | 'prev' | 'goto',
  //   page?: number
  // ) => {
  //   const oldSearchParams = new URLSearchParams(searchParams?.toString());
  //   const newUrlSearchParams = new URLSearchParams(searchParams?.toString());
  //   if (action === 'next') {
  //     newUrlSearchParams.set('page', (Number(page) + 1).toString());
  //   } else if (action === 'prev') {
  //     newUrlSearchParams.set('page', (Number(page) - 1).toString());
  //   } else if (action === 'goto') {
  //     newUrlSearchParams.set('page', page?.toString() || '1');
  //   }
  //   if (oldSearchParams?.toString() !== newUrlSearchParams?.toString()) {
  //     router.replace(`?${newUrlSearchParams?.toString()}`, { scroll: false });
  //   }
  // };

  const handleSortingChange = (orderBy: ProductOrderBy) => {
    const oldSearchParams = new URLSearchParams(searchParams?.toString());
    const newUrlSearchParams = new URLSearchParams(searchParams?.toString());
    newUrlSearchParams.set('orderBy', orderBy);
    if (oldSearchParams?.toString() !== newUrlSearchParams?.toString()) {
      router.replace(`?${newUrlSearchParams?.toString()}`, { scroll: false });
    }
  };

  // const handleLimitChange = (limit: number) => {
  //   const oldSearchParams = new URLSearchParams(searchParams?.toString());
  //   const newUrlSearchParams = new URLSearchParams(searchParams?.toString());
  //   newUrlSearchParams.set('limit', limit.toString());
  //   if (oldSearchParams?.toString() !== newUrlSearchParams?.toString()) {
  //     router.replace(`?${newUrlSearchParams?.toString()}`, { scroll: false });
  //   }
  // };

  // useEffect(() => {
  //   if (errorCategory || errorProducts) {
  //     showPopup('default', {
  //       statusCode: 500,
  //     });
  //   }
  // }, [errorCategory, errorProducts]);

  //! breadCrumb and category
  const [categoryStack, setCategoryStack] = useState<IProductCategory[]>([]);
  const [categoryData, setCategoryData] = useState<IProductCategory | null>(
    null
  );
  const { data: categoryByIdsQuery } = useQuery({
    queryKey: ['categoryByIds', categoryIdList],
    queryFn: () =>
      getCurrentCategoryTree(categoryIdList[categoryIdList.length - 1]),
    enabled: categoryIdList.length > 0,
  });
  useEffect(() => {
    if (categoryIdList.length > 0) {
      const flattenCategoryTree = (
        category: IProductCategory
      ): IProductCategory[] => {
        const result: IProductCategory[] = [category];
        if (category.id === Number(categoryIdList[categoryIdList.length - 1])) {
          setCategoryData(category);
        } else {
          if (category.subCategories && category.subCategories.length > 0) {
            result.push(...flattenCategoryTree(category.subCategories[0]));
          }
        }
        return result;
      };

      const categoryRoot = Array.isArray(categoryByIdsQuery?.data)
        ? categoryByIdsQuery?.data[0]
        : categoryByIdsQuery?.data;

      setCategoryStack(categoryRoot ? flattenCategoryTree(categoryRoot) : []);
    }
  }, [categoryIdList, categoryByIdsQuery?.data]);
  // Slider Settings
  const settings: Settings = {
    infinite: false,
    speed: 500,
    slidesToShow: 8,
    slidesToScroll: 8,
    arrows: (categoryData?.subCategories?.length || 0) > 8,
    prevArrow: (
      <PrevArrow
        customStyles="!w-[2rem] !h-[2rem] !absolute !-translate-y-[2rem] !left-0 !-translate-x-2"
        dynamicArrow={true}
      />
    ),
    nextArrow: (
      <NextArrow
        customStyles="!w-[2rem] !h-[2rem] !absolute !-translate-y-[2rem] !right-0 !-translate-x-[1rem]"
        dynamicArrow={true}
      />
    ),
    adaptiveHeight: true,
    vertical: false,
    responsive: [
      {
        breakpoint: 1536,
        settings: {
          slidesToShow: 7,
          slidesToScroll: 7,
          infinite: false,
          arrows: (categoryData?.subCategories?.length || 0) > 7,
          prevArrow: (
            <PrevArrow
              customStyles="!w-[2rem] !h-[2rem] !absolute !left-0 !-translate-y-[2rem] !-translate-x-2"
              dynamicArrow={true}
            />
          ),
          nextArrow: (
            <NextArrow
              customStyles="!w-[2rem] !h-[2rem] !absolute !right-0 !-translate-y-[2rem] !-translate-x-[1rem]"
              dynamicArrow={true}
            />
          ),
        },
      },
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 6,
          slidesToScroll: 6,
          infinite: false,
          arrows: (categoryData?.subCategories?.length || 0) > 6,
          prevArrow: (
            <PrevArrow
              customStyles="!w-[2rem] !h-[2rem] !absolute !left-0 !-translate-y-[2rem] !-translate-x-[.5rem]"
              dynamicArrow={true}
            />
          ),
          nextArrow: (
            <NextArrow
              customStyles="!w-[2rem] !h-[2rem] !absolute !right-0 !-translate-y-[2rem] !-translate-x-[0rem]"
              dynamicArrow={true}
            />
          ),
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 5,
          infinite: false,
          arrows: (categoryData?.subCategories?.length || 0) > 5,
          prevArrow: (
            <PrevArrow
              customStyles="!w-[2rem] !h-[2rem] !absolute !left-0 !-translate-y-[2rem] !-translate-x-2"
              dynamicArrow={true}
            />
          ),
          nextArrow: (
            <NextArrow
              customStyles="!w-[2rem] !h-[2rem] !absolute !right-0 !-translate-y-[2rem] !-translate-x-[1rem]"
              dynamicArrow={true}
            />
          ),
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 4,
          infinite: false,
          arrows: (categoryData?.subCategories?.length || 0) > 4,
          prevArrow: (
            <PrevArrow
              customStyles="!w-[2rem] !h-[2rem] !absolute !left-0 !-translate-y-[2rem] !-translate-x-2 !flex"
              dynamicArrow={true}
            />
          ),
          nextArrow: (
            <NextArrow
              customStyles="!w-[2rem] !h-[2rem] !absolute !right-0 !-translate-y-[2rem] !-translate-x-[1rem] !flex"
              dynamicArrow={true}
            />
          ),
        },
      },

      {
        breakpoint: 576,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 4,
          infinite: false,
          arrows: (categoryData?.subCategories?.length || 0) > 4,
          prevArrow: (
            <PrevArrow
              customStyles="!w-[2rem] !h-[2rem] !absolute !left-0 !-translate-y-[1.5rem] !-translate-x-2 !flex"
              dynamicArrow={true}
            />
          ),
          nextArrow: (
            <NextArrow
              customStyles="!w-[2rem] !h-[2rem] !absolute !right-0 !-translate-y-[1.5rem] !-translate-x-[1rem] !flex"
              dynamicArrow={true}
            />
          ),
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 4,
          arrows: (categoryData?.subCategories?.length || 0) > 4,
          infinite: false,
          prevArrow: (
            <PrevArrow
              customStyles="!w-[2rem] !h-[2rem] !absolute !-translate-y-[1.5rem] !left-0 !-translate-x-2 !flex"
              dynamicArrow={true}
            />
          ),
          nextArrow: (
            <NextArrow
              customStyles="!w-[2rem] !h-[2rem] !absolute !right-0 !-translate-y-[1.5rem] !translate-x-[0.5rem] !flex"
              dynamicArrow={true}
            />
          ),
        },
      },
      {
        breakpoint: 408,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 4,
          arrows: (categoryData?.subCategories?.length || 0) > 4,
          infinite: false,
          prevArrow: (
            <PrevArrow
              customStyles="!w-[2rem] !h-[2rem] !absolute !-translate-y-[2rem] !left-0 !-translate-x-2 !flex"
              dynamicArrow={true}
            />
          ),
          nextArrow: (
            <NextArrow
              customStyles="!w-[2rem] !h-[2rem] !absolute !right-0 !-translate-y-[2rem] !translate-x-[0.5rem] !flex"
              dynamicArrow={true}
            />
          ),
        },
      },
    ],
  };
  const breadCrumbItems = [
    {
      title: (
        <div className="flex gap-1 mt-0.5">
          <i className="ri-home-6-line"></i>
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
    ...categoryStack?.map((category) => ({
      title: category?.name,
      href: `/category/${category?.name.replaceAll('/', ' ')}-cat${
        category?.path ? `.${category.path}` : ''
      }.${category?.id}`,
    })),
  ];

  if (categoryStack.length === 0) {
    return <CategoryPageSkeleton />;
  }

  return (
    <div className="bg-background-primary">
      <PopupComponent />
      <div className="container mx-auto px-3 sm:px-0">
        <div className="pt-6 pb-8">
          <Breadcrumb separator=">" items={breadCrumbItems} />
        </div>
        <Typography variant="h3">{categoryData?.name}</Typography>
        {(categoryData?.subCategories || []).length > 0 && (
          <div className="py-6">
            <Slider {...settings} className="[&_.slick-track]:!ml-0">
              {categoryData?.subCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  href={`/category/${category.name.replaceAll('/', ' ')}-cat${
                    category.path ? `.${category.path}` : ''
                  }.${category.id}`}
                  category={category}
                />
              ))}
            </Slider>
          </div>
        )}

        {/* Filter */}
        <div className="flex md:hidden justify-between gap-4 mt-2">
          <CustomButton
            variant="outlined"
            icon={<i className="ri-filter-3-line"></i>}
            color="neutral"
            onClick={() => {}}
            className="w-full"
          >
            กรองขั้นสูง
          </CustomButton>
          <div className="relative w-full">
            <CustomButton
              variant="outlined"
              icon={<i className="ri-arrow-down-s-line"></i>}
              iconPosition="end"
              color="neutral"
              onClick={() => setIsSortingDropdownOpen(!isSortingDropdownOpen)}
              className="w-full"
            >
              {orderBy === ProductOrderBy.LOW_PRICE_TO_HIGH_PRICE
                ? 'ราคา ต่ำสุด - สูงสุด'
                : orderBy === ProductOrderBy.HIGH_PRICE_TO_LOW_PRICE
                ? 'ราคา สูงสุด - ต่ำสุด'
                : 'สินค้าขายดี'}
            </CustomButton>
            {/* Dropdown Menu Mobile */}
            {isSortingDropdownOpen && (
              <div
                className="flex flex-col gap-1 border border-border-primary rounded-lg absolute translate-y-1 left-0 z-20 bg-white w-full px-2"
                ref={dropdownMenuMobileRef}
              >
                {sortingOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`flex justify-between items-center p-2 md:hover:bg-background-primary-hover cursor-pointer rounded-lg  ${
                      orderBy === option.value
                        ? 'bg-background-primary-hover'
                        : ''
                    }`}
                    onClick={() => {
                      handleSortingChange(option.value);
                      setIsSortingDropdownOpen(false);
                    }}
                  >
                    <Typography variant="paragraph-medium">
                      {option.label}
                    </Typography>
                    <i
                      className={`ri-check-line text-primary text-lg ${
                        orderBy === option.value ? 'block' : 'hidden'
                      }`}
                    ></i>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/*
        <div className="flex justify-between mt-4 md:mt-6">
          <div className="flex gap-[2rem] items-center">
            <CustomButton
              variant="outlined"
              icon={<i className="ri-filter-3-line"></i>}
              color="neutral"
              onClick={() => {}}
              className="!hidden md:!block"
            >
              กรองขั้นสูง
            </CustomButton>
            <div className="flex gap-2 items-center">
              <Typography
                variant="paragraph-small"
                className="!text-text-quarternary"
              >
                ทั้งหมด
              </Typography>
              <Typography variant="h6" className="!text-text-secondary">
                {productData?.meta?.totalItems}
              </Typography>
              <Typography
                variant="paragraph-small"
                className="!text-text-quarternary"
              >
                รายการ
              </Typography>
            </div>
          </div>
          <div className="flex items-center gap-[2rem]">
            <div className="hidden md:!flex gap-4 items-center">
              <Typography
                variant="paragraph-small"
                className="!text-text-quarternary !w-full"
              >
                เรียงโดย
              </Typography>
              <div className="relative w-full">
                <CustomButton
                  variant="outlined"
                  color="neutral"
                  icon={<i className="ri-arrow-down-s-line"></i>}
                  iconPosition="end"
                  onClick={() => {
                    setIsSortingDropdownOpen(!isSortingDropdownOpen);
                  }}
                >
                  {orderBy === ProductOrderBy.LOW_PRICE_TO_HIGH_PRICE
                    ? 'ราคา ต่ำสุด - สูงสุด'
                    : orderBy === ProductOrderBy.HIGH_PRICE_TO_LOW_PRICE
                    ? 'ราคา สูงสุด - ต่ำสุด'
                    : 'สินค้าขายดี'}
                </CustomButton>

                {isSortingDropdownOpen && (
                  <div
                    className="flex flex-col min-w-[176px] border border-border-primary rounded-lg absolute translate-y-1 left-0 z-20 bg-white w-full px-2"
                    ref={dropdownMenuDesktopRef}
                  >
                    {sortingOptions.map((option) => (
                      <div
                        key={option.value}
                        className={`flex justify-between items-center p-2 md:hover:bg-background-primary-hover cursor-pointer rounded-lg ${
                          orderBy === option.value
                            ? 'bg-background-primary-hover'
                            : ''
                        }`}
                        onClick={() => {
                          handleSortingChange(option.value);
                          setIsSortingDropdownOpen(false);
                        }}
                      >
                        <Typography variant="paragraph-medium">
                          {option.label}
                        </Typography>
                        <i
                          className={`ri-check-line text-primary text-lg ${
                            orderBy === option.value ? 'block' : 'hidden'
                          }`}
                        ></i>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Typography
                variant="paragraph-small"
                className="!text-text-secondary"
              >
                {page}/{totalPages}
              </Typography>
              <div className="flex gap-2">
                <BorderedPrevArrow
                  customStyles="!static"
                  disabled={page === 1}
                  onClick={() => {
                    window.scrollTo(0, 0);
                    handlePageSwitch('prev');
                  }}
                />
                <BorderedNextArrow
                  customStyles="!static"
                  disabled={page === totalPages}
                  onClick={() => {
                    window.scrollTo(0, 0);
                    handlePageSwitch('next');
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 md:mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-[2rem]">
          {products?.length > 0 ? (
            products
              ?.slice((page - 1) * limit, page * limit)
              ?.map((item: IProduct) => (
                <div key={item.id}>
                  <CardProduct product={item} />
                </div>
              ))
          ) : (
            <div className="flex items-center justify-center h-[40vh] col-span-full">
              <EmptyStateComponent />
            </div>
          )}
        </div>
        {!isMobile ? (
          <div className="w-full mt-[2rem] mb-[1rem] flex justify-between items-center">
            <div className="flex gap-2 items-center">
              <Typography
                variant="paragraph-medium"
                className="!text-text-secondary"
              >
                {`ทั้งหมด ${productData?.meta?.totalItems || 0} รายการ`}
              </Typography>
            </div>
            <Pagination
              showSizeChanger
              defaultCurrent={page}
              current={page}
              pageSize={limit}
              total={products?.length || 0}
              pageSizeOptions={[30, 60, 90]}
              onChange={(page) => {
                window.scrollTo(0, 0);
                handlePageSwitch('goto', page);
              }}
              onShowSizeChange={(page, pageSize) => {
                window.scrollTo(0, 0);
                handleLimitChange(pageSize);
              }}
              locale={{
                items_per_page: ' / หน้า',
                prev_page: 'ย้อนกลับ',
                next_page: 'หน้าถัดไป',
              }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-between mt-6">
            <BorderedPrevArrow
              customStyles="!static"
              disabled={page === 1}
              onClick={() => {
                window.scrollTo(0, 0);
                handlePageSwitch('prev');
              }}
            />
            <Typography variant="paragraph-extra-small">{`หน้าที่ ${page}/${totalPages}`}</Typography>
            <BorderedNextArrow
              customStyles="!static"
              disabled={page === totalPages}
              onClick={() => {
                window.scrollTo(0, 0);
                handlePageSwitch('next');
              }}
            />
          </div>
        )}
        */}
      </div>
      <FloatButtons />
    </div>
  );
}
