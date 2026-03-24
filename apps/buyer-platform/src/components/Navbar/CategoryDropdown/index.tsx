'use client';

import { IProductCategory } from '@/common/interfaces/ProductCatagory.interface';
import CustomButton from '@/components/Button';
import CategoryCard from '@/components/Card/Category';
import Typography from '@/components/Typography';
import Image from 'next/image';

import {
  useSubCategoryData,
  useChildrenCategoryData,
} from '@/hooks/useCategoryData';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const AllCategories: React.FC<{
  categories: IProductCategory[];
  onClose: () => void;
}> = ({ categories, onClose }) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <Typography variant="paragraph-big" className="!font-medium">
          หมวดหมู่ทั้งหมด
        </Typography>
        <CustomButton
          variant="outlined"
          color="neutral"
          icon={<i className="ri-close-line"></i>}
          onClick={onClose}
        ></CustomButton>
      </div>
      <div className="grid grid-cols-7 gap-3">
        {categories &&
          categories.map((category) => (
            <div key={category.id} className="col-span-1">
              <CategoryCard
                category={category}
                textVariant="paragraph-medium"
                onClick={onClose}
              />
            </div>
          ))}
      </div>
    </div>
  );
};

const SubCategories: React.FC<{
  currentCategory: IProductCategory;
  onClose: () => void;
}> = ({ currentCategory, onClose }) => {
  const router = useRouter();

  const [isExpanded, setIsExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    currentCategory.subCategories?.forEach((subCategory) => {
      initial[subCategory.id.toString()] = false;
    });
    return initial;
  });
  const maxVisibleItems = 10;
  const getTypographyCount = (subCategories?: IProductCategory[]) => {
    return (
      subCategories?.reduce((total, subCategory) => {
        const childCount = subCategory?.subCategories?.length ?? 0;
        return total + 1 + childCount;
      }, 0) ?? 0
    );
  };

  const getVisibleSubCategories = (
    subCategories: IProductCategory[] | undefined,
    expanded: boolean
  ) => {
    if (expanded) {
      return subCategories ?? [];
    }

    let remaining = maxVisibleItems;
    const visible: IProductCategory[] = [];

    for (const subCategory of subCategories ?? []) {
      if (remaining <= 0) {
        break;
      }

      remaining -= 1;
      let visibleChildren = subCategory?.subCategories ?? [];

      if (visibleChildren?.length > 0) {
        if (remaining <= 0) {
          visibleChildren = [];
        } else if (visibleChildren.length > remaining) {
          visibleChildren = visibleChildren.slice(0, remaining);
          remaining = 0;
        } else {
          remaining -= visibleChildren.length;
        }
      }

      visible.push({
        ...subCategory,
        subCategories: visibleChildren,
      });
    }

    return visible;
  };

  // useEffect(() => {
  //   setIsExpanded((prev) => {
  //     const currentCategoryId = currentCategory.id?.toString() ?? null;
  //     const shouldReset = prevCategoryIdRef.current !== currentCategoryId;
  //     const nextExpanded: Record<string, boolean> = shouldReset
  //       ? {}
  //       : { ...prev };

  //     currentCategory.subCategories?.forEach((subCategory) => {
  //       const key = subCategory.id.toString();
  //       if (nextExpanded[key] === undefined) {
  //         nextExpanded[key] = false;
  //       }
  //     });

  //     prevCategoryIdRef.current = currentCategoryId;
  //     return nextExpanded;
  //   });
  // }, [currentCategory]);

  const handleNavigation = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <div>
      <div
        className="flex w-fit items-center gap-2 hover:!text-primary cursor-pointer"
        onClick={() => {
          const resolvedPath = `/category/${currentCategory.name.replaceAll('/', ' ')}-cat.${currentCategory.id}`;
          handleNavigation(resolvedPath);
        }}
      >
        <Typography
          variant="paragraph-medium"
          className="!font-medium !text-xl !text-inherit"
        >
          {currentCategory.name}
        </Typography>
        <i className="ri-arrow-right-line text-xl"></i>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {currentCategory.subCategories?.map((subCategory) => (
          <div key={subCategory.id} className="h-auto">
            <div
              className={`col-span-1 mt-4 ${
                !isExpanded[subCategory.id.toString()]
                  ? ' overflow-y-hidden'
                  : ''
              }`}
            >
              <Typography
                variant="paragraph-medium"
                className="!font-medium hover:!text-primary cursor-pointer"
                onClick={() => {
                  const resolvedPath = `/category/${subCategory.name.replaceAll('/', ' ')}-cat.${subCategory.id}`;
                  handleNavigation(resolvedPath);
                }}
              >
                {subCategory.name}
              </Typography>
              <div className="mt-3">
                {subCategory.subCategories &&
                  subCategory.subCategories?.length > 0 &&
                  getVisibleSubCategories(
                    subCategory.subCategories,
                    isExpanded[subCategory.id.toString()]
                  ).map((subSubCategory1) => (
                    <ul
                      key={subSubCategory1.id}
                      className="gap-1 cursor-pointer"
                    >
                      <Typography
                        variant="paragraph-medium"
                        className="!text-text-tertiary hover:!text-primary"
                        ellipsis
                        ellipsisOptions={{
                          rows: 2,
                        }}
                        onClick={() => {
                          const resolvedPath = `/category/${subSubCategory1.name.replaceAll('/', ' ')}-cat.${subSubCategory1.id}`;
                          handleNavigation(resolvedPath);
                        }}
                      >
                        {subSubCategory1.name}
                      </Typography>
                      {subSubCategory1.subCategories &&
                        subSubCategory1.subCategories?.length > 0 &&
                        subSubCategory1.subCategories.map((subSubCategory2) => (
                          <li
                            key={subSubCategory2.id}
                            className="ml-3 group cursor-pointer"
                            onClick={() => {
                              const resolvedPath = `/category/${subSubCategory2.name.replaceAll('/', ' ')}-cat.${subSubCategory2.id}`;
                              handleNavigation(resolvedPath);
                            }}
                          >
                            <div className="flex gap-2 items-start ">
                              <Typography
                                variant="paragraph-medium"
                                className="!text-text-tertiary !text-xl !text-inherit group-hover:!text-primary"
                              >
                                {String.fromCodePoint(0x2022)}
                              </Typography>
                              <Typography
                                variant="paragraph-medium"
                                className="!text-text-tertiary !text-inherit group-hover:!text-primary"
                                ellipsis
                                ellipsisOptions={{
                                  rows: 2,
                                }}
                              >
                                {subSubCategory2.name}
                              </Typography>
                            </div>
                          </li>
                        ))}
                    </ul>
                  ))}
              </div>
            </div>
            {getTypographyCount(subCategory.subCategories) >
              maxVisibleItems && (
              <div>
                <CustomButton
                  variant="link"
                  color="primary"
                  icon={
                    isExpanded[subCategory.id.toString()] ? (
                      <i className="ri-arrow-up-s-line"></i>
                    ) : (
                      <i className="ri-arrow-down-s-line"></i>
                    )
                  }
                  onClick={() =>
                    setIsExpanded((prev) => {
                      const key = subCategory.id.toString();
                      return {
                        ...prev,
                        [key]: !prev[key],
                      };
                    })
                  }
                >
                  {isExpanded[subCategory.id.toString()] ? 'ดูน้อย' : 'ดูเพิ่ม'}
                </CustomButton>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

interface CategoryDropdownProps {
  onClose: () => void;
}

export default function CategoryDropdown({ onClose }: CategoryDropdownProps) {
  const {
    data,
    isLoading: isSubLoading,
    isPending: isSubPending,
  } = useSubCategoryData();

  const categories: IProductCategory[] = data?.data || [];

  const [currentCategory, setCurrentCategory] =
    useState<IProductCategory | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const {
    data: childrenCategoriesData,
    isLoading: isChildrenLoading,
    isPending: isChildrenPending,
  } = useChildrenCategoryData(selectedCategoryId ?? '');

  useEffect(() => {
    if (!selectedCategoryId) {
      return;
    }

    const nextSubCategories = childrenCategoriesData?.data || [];

    setCurrentCategory((prev) => {
      if (!prev || prev.id.toString() !== selectedCategoryId) {
        return prev;
      }

      const prevSubCategories = prev.subCategories || [];
      const sameLength = prevSubCategories.length === nextSubCategories.length;
      const sameIds = sameLength
        ? prevSubCategories.every(
            (item, index) => item.id === nextSubCategories[index]?.id
          )
        : false;

      if (sameIds) {
        return prev;
      }

      return {
        ...prev,
        subCategories: nextSubCategories,
      };
    });
  }, [childrenCategoriesData?.data, selectedCategoryId]);

  return (
    <div className="absolute top-[140px] left-0 h-[calc(100vh-140px)] w-full z-30 border-t border-border-primary">
      {/* Content */}
      <div className="bg-white h-[70%] py-6">
        <div className="container mx-auto flex gap-2 h-full">
          {/* Side menu */}
          <div className="flex flex-col gap-2 w-[25%] border-r border-border-primary h-full pr-3 overflow-y-scroll">
            <div
              className={`p-2 rounded-lg hover:bg-background-secondary cursor-pointer ${
                currentCategory === null
                  ? 'bg-background-secondary !text-primary'
                  : ''
              }`}
              onClick={() => setCurrentCategory(null)}
            >
              <Typography
                variant="paragraph-medium"
                className="!font-medium !text-inherit"
              >
                หมวดหมู่ทั้งหมด
              </Typography>
            </div>
            {categories &&
              categories.map((category: IProductCategory) => (
                <div
                  key={category.id}
                  className={`flex items-center gap-2 p-2 rounded-lg hover:bg-background-secondary cursor-pointer ${
                    currentCategory?.id === category.id
                      ? 'bg-background-secondary !text-primary'
                      : ''
                  }`}
                  onClick={() => {
                    setSelectedCategoryId(category.id.toString());
                    setCurrentCategory({
                      ...category,
                      subCategories: [],
                    });
                  }}
                >
                  {category.imageUpload?.url &&
                  category.imageUpload?.url !== '' ? (
                    <Image
                      src={category.imageUpload?.url}
                      alt={category.name || 'Category Image'}
                      width={0}
                      height={0}
                      loading="lazy"
                      className={`aspect-square object-cover object-center w-auto h-full rounded-lg`}
                      onError={(e) => {
                        const currentImg = e.currentTarget as HTMLImageElement;
                        currentImg.src = '/assets/default-image.png';
                        currentImg.className = `aspect-square object-cover object-center w-5 h-5 rounded-lg`;
                      }}
                    />
                  ) : (
                    <Image
                      src="/assets/default-image.png"
                      alt={category.name || 'Default Category Image'}
                      width={0}
                      height={0}
                      loading="lazy"
                      className={`aspect-square object-cover object-center w-5 h-5 rounded-lg`}
                    />
                  )}

                  <Typography
                    variant="paragraph-medium"
                    className="!font-medium !line-clamp-2 !text-inherit"
                  >
                    {category.name}
                  </Typography>
                </div>
              ))}
          </div>
          {/* Main */}
          <div className="w-[75%] px-5 overflow-y-scroll">
            {currentCategory ? (
              <SubCategories
                currentCategory={currentCategory}
                onClose={onClose}
              />
            ) : (
              <AllCategories categories={categories} onClose={onClose} />
            )}
          </div>
        </div>
      </div>
      {/* Mask */}
      <div className="bg-black/50 w-full h-[40%]" onClick={onClose}></div>
    </div>
  );
}
