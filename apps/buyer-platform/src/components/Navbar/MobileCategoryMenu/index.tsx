import { IProductCategory } from '@/common/interfaces/ProductCatagory.interface';
import CustomButton from '@/components/Button';
import Typography from '@/components/Typography';
import {
  useSubCategoryData,
  useChildrenCategoryData,
} from '@/hooks/useCategoryData';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FC, useEffect, useState } from 'react';

interface Props {
  setCurrentView: (
    view: 'main' | 'account' | 'organization' | 'category'
  ) => void;

  onClose: () => void;
}

export const MobileCategoryMenu: FC<Props> = ({ setCurrentView, onClose }) => {
  const router = useRouter();
  const { data } = useSubCategoryData();

  const categories: IProductCategory[] = data?.data || [];
  const [categoryStack, setCategoryStack] = useState<IProductCategory[]>([]);
  const [pendingCategory, setPendingCategory] =
    useState<IProductCategory | null>(null);

  const currentCategory = categoryStack.length
    ? categoryStack[categoryStack.length - 1]
    : null;

  const activeCategoryId = pendingCategory
    ? String(pendingCategory.id)
    : currentCategory
    ? String(currentCategory.id)
    : '';

  const { data: childrenData, isLoading: isChildrenLoading } =
    useChildrenCategoryData(activeCategoryId);

  const currentCategories: IProductCategory[] = currentCategory
    ? (childrenData?.data as IProductCategory[]) || []
    : categories;

  const handleCategoryClick = (cat: IProductCategory) => {
    if (cat.subCategories && cat.subCategories.length > 0) {
      setCategoryStack((prev) => [...prev, cat]);
      return;
    }

    setPendingCategory(cat);
  };

  useEffect(() => {
    if (!pendingCategory || isChildrenLoading) {
      return;
    }

    const childrenCategories = childrenData?.data || [];

    if (childrenCategories.length > 0) {
      setCategoryStack((prev) => [...prev, pendingCategory]);
      setPendingCategory(null);
      return;
    }

    const resolvedPath = `/category/${pendingCategory.name}-cat${
      pendingCategory.path ? `.${pendingCategory.path}` : ''
    }.${pendingCategory.id}`;
    onClose();
    setCurrentView('main');
    router.push(resolvedPath);
    setPendingCategory(null);
  }, [
    pendingCategory,
    childrenData,
    isChildrenLoading,
    onClose,
    router,
    setCurrentView,
  ]);

  const handleBack = () => {
    if (pendingCategory) {
      setPendingCategory(null);
    }

    if (categoryStack.length > 0) {
      setCategoryStack(categoryStack.slice(0, -1));
    } else {
      setCurrentView('main');
    }
  };

  return (
    <div className="relative h-[calc(100vh_-_86px)] px-2">
      <CustomButton
        color="neutral"
        variant="ghost"
        icon={<i className="ri-arrow-left-line"></i>}
        onClick={handleBack}
        bold="400"
        className="!px-2"
      >
        ย้อนกลับ
      </CustomButton>
      <div className="px-2 mt-2">
        <div className="flex flex-col gap-1">
          <div className="w-full px-2 flex justify-between items-center">
            <Typography
              variant="paragraph-medium"
              className="!font-medium !mb-1"
              ellipsis
              ellipsisOptions={{
                rows: 1,
              }}
            >
              {currentCategory ? currentCategory.name : 'หมวดหมู่ทั้งหมด'}
            </Typography>
            {currentCategory && (
              <Link
                href={`/category/${currentCategory.name.replaceAll('/', ' ')}-cat${
                  currentCategory.path ? `.${currentCategory.path}` : ''
                }.${currentCategory.id}`}
                onClick={() => {
                  onClose();
                  setCurrentView('main');
                }}
              >
                <i className="ri-search-line font-medium text-xl text-text-primary"></i>
              </Link>
            )}
          </div>
          <div className="overflow-y-scroll">
            {currentCategories.map((cat) => (
              <div
                key={cat.id}
                className="px-2 h-10 flex items-center justify-between text-sm text-text-secondary cursor-pointer hover:bg-background-secondary rounded"
                onClick={() => handleCategoryClick(cat)}
              >
                <Typography
                  variant="paragraph-medium"
                  className="!mb-1"
                  ellipsis
                  ellipsisOptions={{
                    rows: 1,
                  }}
                >
                  {cat.name}
                </Typography>
                {(cat?.isChildren ||
                  (cat.subCategories && cat.subCategories.length > 0)) && (
                  <i className="ri-arrow-right-s-line text-base"></i>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
