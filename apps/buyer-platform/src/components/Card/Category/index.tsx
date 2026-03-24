import { IProductCategory } from '@/common/interfaces/ProductCatagory.interface';
import Typography, { TypographyVariant } from '@/components/Typography';
import { Grid } from 'antd';
import Image from 'next/image';
import Link from 'next/link';

interface Props {
  category: IProductCategory;
  href?: string;
  textVariant?: TypographyVariant;
  onClick?: () => void;
}

export default function CategoryCard({
  category,
  href,
  textVariant,
  onClick,
}: Props) {
  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;
  return (
    <Link
      href={href || `/category/${category.name.replaceAll('/', ' ')}-cat.${category.id}`}
      className="outline-none"
      onClick={onClick}
    >
      <div
        className={`overflow-hidden flex flex-col justify-center items-center ${
          isMobile
            ? 'gap-1 max-w-[108px]'
            : 'gap-3 max-w-[162px] hover:border-border-primary-light'
        } cursor-pointer p-2 rounded-lg bg-background-primary/90 border-[1px] border-transparent transition-colors duration-300`}
      >
        <div
          className={`w-full h-auto rounded-lg bg-background-secondary flex items-center justify-center aspect-square `}
        >
          {category.imageUpload?.url && category.imageUpload?.url !== '' ? (
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
                currentImg.className = `aspect-square object-cover object-center w-[60%] h-auto rounded-lg`;
              }}
            />
          ) : (
            <Image
              src="/assets/default-image.png"
              alt={category.name || 'Default Category Image'}
              width={0}
              height={0}
              loading="lazy"
              className={`aspect-square object-cover object-center w-[60%] h-auto rounded-lg`}
            />
          )}
        </div>
        <Typography
          variant={
            isMobile ? 'paragraph-extra-small' : textVariant || 'paragraph-big'
          }
          className={`!font-medium !text-text-secondary leading-6 !line-clamp-2`}
        >
          {category.name}
        </Typography>
      </div>
    </Link>
  );
}
